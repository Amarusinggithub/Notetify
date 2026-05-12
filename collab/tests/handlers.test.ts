import jwt from "jsonwebtoken";
import * as Y from "yjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("jsonwebtoken", () => ({
    default: { verify: vi.fn(), sign: vi.fn() },
}));

vi.mock("undici", () => ({
    fetch: vi.fn(),
}));

vi.mock("@hocuspocus/transformer", () => ({
    TiptapTransformer: {
        fromYdoc: vi.fn(() => ({ type: "doc", content: [] })),
    },
}));

import { fetch } from "undici";
import { applyRolePermissions, authenticate, loadDocument, storeDocument } from "../src/handlers.js";

const JWT_SECRET = "test-secret";
const LARAVEL_URL = "http://api:80";
const WEBHOOK_SECRET = "webhook-secret";

// ---------------------------------------------------------------------------
// authenticate
// ---------------------------------------------------------------------------
describe("authenticate", () => {
    beforeEach(() => vi.clearAllMocks());

    it("returns user context for a valid token matching the document", () => {
        vi.mocked(jwt.verify).mockReturnValue({
            sub: "user-1",
            noteId: "note-abc",
            role: "editor",
        } as never);

        const result = authenticate("valid-token", "note:note-abc", JWT_SECRET);

        expect(result).toEqual({ user: { id: "user-1", role: "editor" } });
    });

    it("throws when documentName does not match noteId in token", () => {
        vi.mocked(jwt.verify).mockReturnValue({
            sub: "user-1",
            noteId: "note-abc",
            role: "editor",
        } as never);

        expect(() => authenticate("valid-token", "note:different", JWT_SECRET)).toThrow(
            "Token does not match document",
        );
    });

    it("throws when jwt.verify throws (invalid or expired token)", () => {
        vi.mocked(jwt.verify).mockImplementation(() => {
            throw new Error("invalid signature");
        });

        expect(() => authenticate("bad-token", "note:note-abc", JWT_SECRET)).toThrow(
            "invalid signature",
        );
    });

    it("calls jwt.verify with the token and secret", () => {
        vi.mocked(jwt.verify).mockReturnValue({
            sub: "user-1",
            noteId: "note-abc",
            role: "viewer",
        } as never);

        authenticate("my-token", "note:note-abc", JWT_SECRET);

        expect(jwt.verify).toHaveBeenCalledWith("my-token", JWT_SECRET);
    });
});

// ---------------------------------------------------------------------------
// loadDocument
// ---------------------------------------------------------------------------
describe("loadDocument", () => {
    beforeEach(() => vi.clearAllMocks());

    it("returns a Y.Doc with state applied when ydocState is present", async () => {
        const source = new Y.Doc();
        source.getText("default").insert(0, "hello");
        const state = Buffer.from(Y.encodeStateAsUpdate(source)).toString("base64");

        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ ydocState: state }),
        } as never);

        const result = await loadDocument("note:note-1", LARAVEL_URL, WEBHOOK_SECRET);

        expect(result).toBeInstanceOf(Y.Doc);
        expect(result.getText("default").toString()).toBe("hello");
    });

    it("returns an empty Y.Doc when ydocState is null", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ ydocState: null }),
        } as never);

        const result = await loadDocument("note:note-1", LARAVEL_URL, WEBHOOK_SECRET);

        expect(result).toBeInstanceOf(Y.Doc);
    });

    it("throws when the API returns a non-ok response", async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: false, status: 404 } as never);

        await expect(loadDocument("note:note-1", LARAVEL_URL, WEBHOOK_SECRET)).rejects.toThrow(
            "load failed: 404",
        );
    });

    it("calls the correct URL with the webhook secret header", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ ydocState: null }),
        } as never);

        await loadDocument("note:note-xyz", LARAVEL_URL, WEBHOOK_SECRET);

        expect(fetch).toHaveBeenCalledWith(
            "http://api:80/api/collab/notes/note-xyz",
            expect.objectContaining({
                headers: { "X-Collab-Secret": WEBHOOK_SECRET },
            }),
        );
    });

    it("strips the note: prefix when building the URL", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ ydocState: null }),
        } as never);

        await loadDocument("note:abc-123", LARAVEL_URL, WEBHOOK_SECRET);

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/collab/notes/abc-123"),
            expect.anything(),
        );
    });
});

// ---------------------------------------------------------------------------
// storeDocument
// ---------------------------------------------------------------------------
describe("storeDocument", () => {
    const mockPub = { publish: vi.fn() };

    beforeEach(() => {
        vi.clearAllMocks();
        mockPub.publish.mockResolvedValue(undefined);
    });

    it("calls PUT on the correct URL with ydocState and content", async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: true } as never);
        const doc = new Y.Doc();

        await storeDocument("note:note-1", doc, "user-1", LARAVEL_URL, WEBHOOK_SECRET, mockPub);

        expect(fetch).toHaveBeenCalledWith(
            "http://api:80/api/collab/notes/note-1",
            expect.objectContaining({
                method: "PUT",
                headers: expect.objectContaining({
                    "Content-Type": "application/json",
                    "X-Collab-Secret": WEBHOOK_SECRET,
                }),
            }),
        );
    });

    it("publishes a note.updated event to the correct Redis channel", async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: true } as never);
        const doc = new Y.Doc();

        await storeDocument("note:note-1", doc, "user-1", LARAVEL_URL, WEBHOOK_SECRET, mockPub);

        expect(mockPub.publish).toHaveBeenCalledWith(
            "notes:user:user-1",
            expect.stringContaining('"type":"note.updated"'),
        );
    });

    it("includes noteId and userId in the Redis payload", async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: true } as never);
        const doc = new Y.Doc();

        await storeDocument("note:note-1", doc, "user-42", LARAVEL_URL, WEBHOOK_SECRET, mockPub);

        const [, payload] = mockPub.publish.mock.calls[0] as [string, string];
        const parsed = JSON.parse(payload) as Record<string, unknown>;
        expect(parsed.noteId).toBe("note-1");
        expect(parsed.by).toBe("user-42");
    });

    it("throws when the API returns a non-ok response", async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500 } as never);
        const doc = new Y.Doc();

        await expect(
            storeDocument("note:note-1", doc, "user-1", LARAVEL_URL, WEBHOOK_SECRET, mockPub),
        ).rejects.toThrow("store failed: 500");
    });

    it("does not publish to Redis when the API call fails", async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500 } as never);
        const doc = new Y.Doc();

        await expect(
            storeDocument("note:note-1", doc, "user-1", LARAVEL_URL, WEBHOOK_SECRET, mockPub),
        ).rejects.toThrow();

        expect(mockPub.publish).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// applyRolePermissions
// ---------------------------------------------------------------------------
describe("applyRolePermissions", () => {
    it("sets connection.readOnly to true for viewer role", () => {
        const connection = { readOnly: false as boolean | unknown };
        applyRolePermissions(connection, "viewer");
        expect(connection.readOnly).toBe(true);
    });

    it("does not modify connection for editor role", () => {
        const connection = { readOnly: false as boolean | unknown };
        applyRolePermissions(connection, "editor");
        expect(connection.readOnly).toBe(false);
    });

    it("does not modify connection for undefined role", () => {
        const connection = { readOnly: false as boolean | unknown };
        applyRolePermissions(connection, undefined);
        expect(connection.readOnly).toBe(false);
    });
});
