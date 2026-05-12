import { Redis } from "@hocuspocus/extension-redis";
import { Server } from "@hocuspocus/server";
import { createClient } from "redis";
import { authenticate, applyRolePermissions, loadDocument, storeDocument, type AuthContext } from "./handlers.js";

const {
    PORT = "1234",
    COLLAB_JWT_SECRET,
    WEBHOOK_SECRET,
    LARAVEL_URL = "http://api:80",
    REDIS_HOST = "redis",
    REDIS_PORT = "6379",
} = process.env;

if (!COLLAB_JWT_SECRET || !WEBHOOK_SECRET) {
    throw new Error("COLLAB_JWT_SECRET and WEBHOOK_SECRET are required");
}

const pub = createClient({ url: `redis://${REDIS_HOST}:${REDIS_PORT}` });
await pub.connect();

const server = new Server({
    port: Number(PORT),

    extensions: [new Redis({ host: REDIS_HOST, port: Number(REDIS_PORT) })],

    async onAuthenticate({ token, documentName, connection }) {
        const ctx = authenticate(token, documentName, COLLAB_JWT_SECRET);
        applyRolePermissions(connection, ctx.user.role);
        return ctx;
    },

    async onLoadDocument({ documentName }) {
        return loadDocument(documentName, LARAVEL_URL, WEBHOOK_SECRET);
    },

    async onStoreDocument({ documentName, document, lastContext }) {
        const userId = (lastContext as AuthContext).user.id;
        await storeDocument(documentName, document, userId, LARAVEL_URL, WEBHOOK_SECRET, pub);
    },

    debounce: 2000,
    maxDebounce: 10000,
});

server.listen();
