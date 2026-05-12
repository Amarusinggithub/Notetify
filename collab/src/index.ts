import { Redis } from "@hocuspocus/extension-redis";
import { Server } from "@hocuspocus/server";
import { createClient } from "redis";
import { authenticate, applyRolePermissions, loadDocument, storeDocument, type AuthContext } from "./handlers.js";

const {
    PORT = "1234",
    JWT_SECRET,
    WEBHOOK_SECRET,
    LARAVEL_URL = "http://api:80",
    REDIS_HOST = "redis",
    REDIS_PORT = "6379",
} = process.env;

if (!JWT_SECRET || !WEBHOOK_SECRET) {
    throw new Error("JWT_SECRET and WEBHOOK_SECRET are required");
}

const pub = createClient({ url: `redis://${REDIS_HOST}:${REDIS_PORT}` });
await pub.connect();

const server = new Server({
    port: Number(PORT),

    extensions: [new Redis({ host: REDIS_HOST, port: Number(REDIS_PORT) })],

    async onAuthenticate({ token, documentName }) {
        return authenticate(token, documentName, JWT_SECRET);
    },

    async onLoadDocument({ documentName }) {
        return loadDocument(documentName, LARAVEL_URL, WEBHOOK_SECRET);
    },

    async onStoreDocument({ documentName, document, context }) {
        const userId = (context as AuthContext).user.id;
        await storeDocument(documentName, document, userId, LARAVEL_URL, WEBHOOK_SECRET, pub);
    },

    async onStateless({ connection, context }) {
        const role = (context as AuthContext | undefined)?.user?.role;
        applyRolePermissions(connection, role);
    },

    debounce: 2000,
    maxDebounce: 10000,
});

server.listen();
