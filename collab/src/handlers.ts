import { TiptapTransformer } from "@hocuspocus/transformer";
import jwt from "jsonwebtoken";
import { fetch } from "undici";
import * as Y from "yjs";

export interface AuthContext {
    user: { id: string; role: string };
}

export interface PubClient {
    publish(channel: string, message: string): Promise<unknown>;
}

export function authenticate(
    token: string,
    documentName: string,
    jwtSecret: string,
): AuthContext {
    const payload = jwt.verify(token, jwtSecret) as {
        sub: string;
        noteId: string;
        role: string;
    };
    if (`note:${payload.noteId}` !== documentName) {
        throw new Error("Token does not match document");
    }
    return { user: { id: payload.sub, role: payload.role } };
}

export async function loadDocument(
    documentName: string,
    laravelUrl: string,
    webhookSecret: string,
): Promise<Y.Doc> {
    const noteId = documentName.replace(/^note:/, "");
    const res = await fetch(`${laravelUrl}/api/collab/notes/${noteId}`, {
        headers: { "X-Collab-Secret": webhookSecret },
    });
    if (!res.ok) throw new Error(`load failed: ${res.status}`);
    const { ydocState } = (await res.json()) as { ydocState: string | null };

    const doc = new Y.Doc();
    if (ydocState) {
        Y.applyUpdate(doc, Buffer.from(ydocState, "base64"));
    }
    return doc;
}

export async function storeDocument(
    documentName: string,
    document: Y.Doc,
    userId: string,
    laravelUrl: string,
    webhookSecret: string,
    pubClient: PubClient,
): Promise<void> {
    const noteId = documentName.replace(/^note:/, "");
    const ydocState = Buffer.from(Y.encodeStateAsUpdate(document)).toString("base64");
    const content = TiptapTransformer.fromYdoc(document, 'default');

    const res = await fetch(`${laravelUrl}/api/collab/notes/${noteId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-Collab-Secret": webhookSecret,
        },
        body: JSON.stringify({ ydocState, content }),
    });
    if (!res.ok) throw new Error(`store failed: ${res.status}`);

    await pubClient.publish(
        `notes:user:${userId}`,
        JSON.stringify({ type: "note.updated", noteId, at: Date.now(), by: userId }),
    );
}

export function applyRolePermissions(
    connection: { readOnly: boolean | unknown },
    role: string | undefined,
): void {
    if (role === "viewer") {
        connection.readOnly = true;
    }
}
