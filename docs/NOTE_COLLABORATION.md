# Real-time Collaboration — Implementation Plan

This document describes how to add real-time, multi-user collaborative editing to
Notetify using **Tiptap + Yjs + Hocuspocus**, while keeping **Laravel (PHP) as
the source of truth** for authentication, authorization, and persistent storage.

Hocuspocus is a Node.js server — it cannot run inside PHP-FPM. We add a small
Node service alongside the existing `api` container; Laravel keeps owning
auth and the canonical note state.

---

## 1. Architecture

```
                ┌────────────────────────┐
                │   Browser (React)      │
                │   Tiptap + Y.Doc       │
                │   HocuspocusProvider   │
                └─────────┬──────────────┘
                          │ 1. POST /api/collab/token  (Sanctum cookie)
                          │ 2. WS /collab?token=JWT
                          ▼
        ┌────────────────────────────────────────┐
        │   nginx / Vite proxy                   │
        │   - /api/*    → Laravel (api)          │
        │   - /collab   → Hocuspocus (collab)    │
        └─────────┬───────────────────┬──────────┘
                  │                   │
                  ▼                   ▼
        ┌──────────────────┐   ┌──────────────────────┐
        │ Laravel (PHP)    │   │ Hocuspocus (Node)    │
        │ - Sanctum auth   │   │ - onAuthenticate JWT │
        │ - Issues JWT     │◄──┤ - onLoadDocument     │
        │ - Notes CRUD     │──►│ - onStoreDocument    │
        │ - Authoritative  │   │ - Redis pub/sub      │
        └─────────┬────────┘   └──────────┬───────────┘
                  │                       │
                  ▼                       ▼
              Postgres                  Redis
```

**Responsibilities**

| Concern | Owner |
|---|---|
| User auth (login, sessions) | Laravel + Sanctum |
| Issuing collab JWTs | Laravel |
| Verifying JWTs on WS connect | Hocuspocus |
| Note metadata CRUD (tags, notebook, pinned, etc.) | Laravel REST |
| Note **body** edits (incl. title — it's the first H1) | Hocuspocus (CRDT) — never edited via REST |
| Realtime CRDT sync | Hocuspocus |
| Persisting note content | Laravel (called by Hocuspocus webhook) |
| Multi-instance fanout | Redis (Hocuspocus extension) |
| Attachments (images, files) | Laravel + RustFS, referenced by URL inside the doc |

---

## 2. Data lifecycle & source of truth

This is the most important mental model in this doc. Read it before writing
any code.

### 2.1 Two representations of the same note

Each note is stored twice in `notes`:

- `ydoc_state` (`BYTEA`) — Yjs binary CRDT state. **Source of truth while
  collaborating.** This is the only format that can merge concurrent edits
  from multiple users.
- `content` (`JSONB`) — Tiptap JSON snapshot. A **derived view** of the
  Yjs document. Cheap to read, query, and render; cannot be merged.

**Invariant:** they are always written together, in the same `UPDATE`,
both derived from the same in-memory `Y.Doc`. JSONB never leads — BYTEA
leads, JSONB follows.

```
                   ┌─────────────────────────┐
                   │    Y.Doc (in memory)    │
                   │   in Hocuspocus, Node   │
                   └───────────┬─────────────┘
                               │ on flush (debounced)
                ┌──────────────┴──────────────┐
                ▼                             ▼
   Y.encodeStateAsUpdate(doc)     TiptapTransformer.fromYdoc(doc)
        = Uint8Array                       = JSON
                │                             │
                ▼                             ▼
        notes.ydoc_state               notes.content
           (BYTEA)                        (JSONB)
        ◄── source of truth ──►       ◄── derived snapshot ──►
        used by collab WS             used by sidebar / search / exports
```

If they ever diverge: trust BYTEA, regenerate JSONB from it.

### 2.2 Read paths

**Sidebar / list view (no WebSocket):**

```
Browser ──GET /api/notes──► Laravel ──SELECT id, title, content──► Postgres
                              │
                              ▼
                    JSON response (uses content JSONB)
```

The sidebar never touches `ydoc_state`. It reads the JSONB snapshot, which is
at most a debounce-window stale (~2–10s).

**Opening a note (WebSocket connects):**

```
1. Browser ──POST /api/collab/token/:noteId──► Laravel
                                                  │
                                  returns { token: JWT, wsUrl, docId }
                                                  ▼
2. Browser ──WS /collab?token=JWT──► Hocuspocus
                                       │
3.                                     │ onAuthenticate: verify JWT
                                       │ onLoadDocument:
                                       ▼
                             Hocuspocus ──GET /api/collab/notes/:id──► Laravel
                                                                          │
                                  returns { ydocState: base64(BYTEA) }    │
                                                  ▼
                             Y.applyUpdate(doc, bytes)  ← reconstructs Y.Doc
                                                  │
4.                              syncs full state to browser over WS       │
                                                  ▼
                                  Browser now has live, editable Y.Doc
```

From this point on, **every keystroke is a Yjs update over the WS**, broadcast
to other connected browsers. Postgres is not touched per keystroke.

### 2.3 Write path (during a session)

```
Keystroke ──Yjs update──► Hocuspocus ──fanout──► other browsers
                              │
                              │ debounce: 2000ms idle
                              │ maxDebounce: 10000ms (force flush)
                              ▼
                   onStoreDocument fires:
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
      Y.encodeStateAsUpdate(doc)   TiptapTransformer.fromYdoc(doc)
                │                           │
                └─────────┬─────────────────┘
                          ▼
       PUT /api/collab/notes/:id  { ydocState, content }
                          │
                          ▼
                       Laravel
                          │
                          ▼
              UPDATE notes SET
                ydoc_state = :bytes,
                content    = :json,
                updated_at = NOW()
              WHERE id = :id;
```

Both columns flushed atomically. The sidebar will see the new `content` on
its next refresh.

### 2.4 Disconnect / idle

When the **last** client disconnects from a document:

```
last WS closes ──► Hocuspocus fires final onStoreDocument
                     │
                     ▼
              one last PUT /api/collab/notes/:id
                     │
                     ▼
              Y.Doc unloaded from Node memory
```

There is no "save on close" magic — it's just one more `onStoreDocument` call
under the same debounce contract. After it returns, Postgres holds the latest
state and Hocuspocus forgets the doc until someone reopens it.

If the Node process crashes mid-session, you lose at most one debounce window
(≤ 10s of edits) since the last successful flush. Browsers with offline edits
still in their local Y.Doc will re-sync them on reconnect.

### 2.5 Critical guardrail — never write `content` outside collab

The Y.Doc in Hocuspocus memory does not know about edits made directly to
`notes.content` via REST. Its next flush will **overwrite** any such edit.

Rules:

- `PUT /api/notes/:id` (the existing REST endpoint) handles **metadata only**:
  `notebook_id`, `tags`, `is_pinned`, etc. It must **not** modify `content` or
  `ydoc_state`. **Title is not metadata** — it lives inside `content` as the
  first H1, so it can only be changed inside the editor.
- All body edits (including renames) go through Hocuspocus → `onStoreDocument`
  → Laravel webhook.
- If you ever need to mutate the body server-side (e.g. an admin tool, a
  template insertion, an AI rewrite), do it by:
  1. Loading `ydoc_state` into a `Y.Doc` in Node,
  2. Mutating the doc via the Yjs API,
  3. Letting Hocuspocus persist the result through the same `onStoreDocument`
     path.

Enforce this at the controller level — `NoteController@update` should
explicitly drop `content` and `ydoc_state` from the validated input.

### 2.6 At-a-glance state machine

```
                      ┌──────────────┐
        no clients →  │  Cold (DB)   │  ← single source of truth: ydoc_state
                      └──────┬───────┘
                first WS ↓     ↑ last WS closes + final flush
                      ┌──────────────┐
        clients   →   │ Hot (Node)   │  ← single source of truth: in-mem Y.Doc
                      │  Y.Doc live  │     DB lags by ≤ debounce window
                      └──────┬───────┘
                debounced ↓     ↑
                      ┌──────────────┐
                      │  Flush PUT   │  ← writes BYTEA + JSONB atomically
                      └──────────────┘
```

---

## 3. Storage model

Notetify uses a **hybrid** storage layout. Each piece of data lives in the
system best suited for it:

| Data | Where | Column / location | Why |
|---|---|---|---|
| Tiptap JSON snapshot | Postgres | `notes.content` (`JSONB`) | Queryable, indexable, atomic with note metadata, used for search/exports/previews |
| Yjs binary CRDT state | Postgres | `notes.ydoc_state` (`BYTEA`, nullable) | Opaque bytes — the full edit history Hocuspocus hands clients on reconnect; must commit atomically with `content` |
| Attachments (images, files embedded in notes) | RustFS (S3-compatible) | object key like `notes/<note_id>/<uuid>` | Big binary blobs don't belong in the DB; served directly to the browser via signed URLs |

`BYTEA` is just Postgres's raw-bytes type (the equivalent of MySQL `BLOB`). It
holds the output of `Y.encodeStateAsUpdate(doc)` — an opaque `Uint8Array`. PHP
never inspects it; it only round-trips it (base64-encoded) between Postgres and
the Hocuspocus webhook.

### 3.1 Title lives inside the document

Notetify does **not** store the title in a separate column. The title is the
first `<h1>` node inside the Tiptap document. This means:

- Renaming a note can only happen **inside the editor** — the user edits the
  H1 directly. There is no inline rename in the sidebar; the sidebar title is
  read-only. The editor opens a WS, the user edits the H1, Hocuspocus flushes
  — same path as any other body edit.
- The sidebar reads the title by extracting the first H1 from the JSONB.
  Because notes are accessed through the `UserNote` pivot (which covers both
  owned and shared notes), the query JOINs accordingly:

  ```sql
  -- Postgres expression for "first h1 text" in a Tiptap doc
  SELECT
    n.id,
    COALESCE(
      jsonb_path_query_first(
        n.content,
        '$.content[*] ? (@.type == "heading" && @.attrs.level == 1).content[*].text'
      ) #>> '{}',
      'Untitled'
    ) AS title,
    n.updated_at
  FROM notes n
  INNER JOIN user_notes un ON un.note_id = n.id
  WHERE un.user_id = :uid
    AND un.is_trashed = false
  ORDER BY n.updated_at DESC;
  ```

  Wrap this in an Eloquent accessor or a dedicated SQL view so the rest of
  the app keeps treating `note.title` as a plain string.
- Search is also a JSONB query: `WHERE content::text ILIKE '%term%'` for a
  quick start, or a `tsvector` generated column over the doc text for real
  full-text search.
- If your `notes` table currently has a `title` column, **drop it** in this
  migration so there is no stale source of truth.

### 3.2 Migration

```php
// database/migrations/<timestamp>_add_collab_columns_to_notes.php
public function up(): void
{
    Schema::table('notes', function (Blueprint $table) {
        if (Schema::hasColumn('notes', 'title')) {
            $table->dropColumn('title'); // title now lives inside content
        }
        if (!Schema::hasColumn('notes', 'content')) {
            $table->jsonb('content')->nullable();
        }
        $table->binary('ydoc_state')->nullable();
    });
}
```

Run it with:

```bash
docker compose -f docker-compose.dev.yaml exec api php artisan migrate
```

### 3.3 Attachments via RustFS

Image uploads and file attachments inside a note do **not** go through
Hocuspocus — they're regular HTTP uploads handled by the existing
`FileController`. Configure Laravel's `s3` filesystem driver to point at your
RustFS endpoint:

```php
// config/filesystems.php
'rustfs' => [
    'driver'   => 's3',
    'key'      => env('RUSTFS_KEY'),
    'secret'   => env('RUSTFS_SECRET'),
    'region'   => env('RUSTFS_REGION', 'us-east-1'),
    'bucket'   => env('RUSTFS_BUCKET', 'notetify'),
    'endpoint' => env('RUSTFS_ENDPOINT'), // e.g. http://rustfs:9000
    'use_path_style_endpoint' => true,
],
```

In the editor flow:

1. User drops an image into Tiptap.
2. Client `POST`s the file to `/api/files` (Sanctum-authenticated).
3. `FileController` stores it via `Storage::disk('rustfs')` and returns a
   signed URL.
4. The URL is inserted into the Tiptap document as an `<img src=...>` node —
   only the URL ends up in the Yjs document, not the binary.

This keeps the CRDT payload small, attachments cacheable by the browser, and
note content searchable.

### 3.4 Prerequisites checklist

- [ ] `notes.content` (`JSONB`) and `notes.ydoc_state` (`BYTEA`) columns exist.
- [ ] `notes.title` column dropped (title is now the first H1 inside `content`).
- [ ] `COLLAB_JWT_SECRET` and `COLLAB_WEBHOOK_SECRET` generated and shared
      between Laravel and Hocuspocus.
- [ ] RustFS reachable from `api` and a bucket created for attachments.

---

## 4. Step-by-step

### Step 1 — Install JWT support in Laravel

```bash
docker compose -f docker-compose.dev.yaml exec api \
  composer require firebase/php-jwt
```

Add to `api/.env.development`:

```
COLLAB_JWT_SECRET=<openssl rand -hex 32>
COLLAB_JWT_TTL=3600
COLLAB_WEBHOOK_SECRET=<openssl rand -hex 32>
```

Mirror these into `docker-compose.dev.yaml` `api.environment` and the new
`collab` service we add in Step 6.

### Step 2 — Add the collab token endpoint (Laravel)

Create `api/app/Http/Controllers/CollabController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Firebase\JWT\JWT;
use Illuminate\Http\Request;

class CollabController extends Controller
{
    public function token(Request $request, string $noteId)
    {
        $user = $request->user();
        $note = Note::findOrFail($noteId);
        $this->authorize('update', $note); // reuses existing Note policy

        $now = time();
        $payload = [
            'sub'    => (string) $user->id,
            'name'   => $user->name,
            'noteId' => (string) $note->id,
            'role'   => 'editor',
            'iat'    => $now,
            'exp'    => $now + (int) config('services.collab.ttl', 3600),
        ];

        return response()->json([
            'token'  => JWT::encode($payload, config('services.collab.secret'), 'HS256'),
            'wsUrl'  => config('services.collab.ws_url'),
            'docId'  => "note:{$note->id}",
        ]);
    }

    public function viewerToken(Request $request, string $noteId)
    {
        $user = $request->user();
        $note = Note::findOrFail($noteId);
        $this->authorize('view', $note); // read-only share check

        $now = time();
        $payload = [
            'sub'    => (string) $user->id,
            'name'   => $user->name,
            'noteId' => (string) $note->id,
            'role'   => 'viewer',  // Hocuspocus rejects writes for this role
            'iat'    => $now,
            'exp'    => $now + (int) config('services.collab.ttl', 3600),
        ];

        return response()->json([
            'token'  => JWT::encode($payload, config('services.collab.secret'), 'HS256'),
            'wsUrl'  => config('services.collab.ws_url'),
            'docId'  => "note:{$note->id}",
        ]);
    }
}
```

> **JWT `role` vs `Permission` enum.** The collab JWT carries a `role` string
> (`'editor'` or `'viewer'`), not a `Permission` enum value. The mapping is:
>
> | `Permission` (REST / DB) | JWT `role` (collab WS) |
> |---|---|
> | `view` | `'viewer'` — read-only WS, `editable: false` |
> | `comment` | `'viewer'` — comments go through REST, not the doc body |
> | `edit` | `'editor'` — full read/write WS |
> | owner (`is_owner = true`) | `'editor'` — same as edit for collab purposes |
>
> `CollabController@token` inspects the user's `Permission` on the relevant
> `NoteShare` (or falls back to owner check) and sets the JWT role accordingly.
> Hocuspocus only cares about read vs. read-write; the finer `comment` distinction
> is enforced at the REST layer, not inside the CRDT.

Register in `api/routes/api.php` inside the `auth:sanctum` group:

```php
Route::post('collab/token/{note}',        [CollabController::class, 'token']);
Route::post('collab/token/{note}/viewer', [CollabController::class, 'viewerToken']);
```

Add to `api/config/services.php`:

```php
'collab' => [
    'secret'         => env('COLLAB_JWT_SECRET'),
    'ttl'            => env('COLLAB_JWT_TTL', 3600),
    'ws_url'         => env('COLLAB_WS_URL', 'ws://localhost:1234'),
    'webhook_secret' => env('COLLAB_WEBHOOK_SECRET'),
],
```

### Step 3 — Add the persistence webhook endpoints (Laravel)

Hocuspocus calls Laravel for the initial document load and after every
debounced change. Add two routes that are protected by a shared HMAC header
(NOT Sanctum — these are server-to-server):

```php
// routes/api.php — outside auth:sanctum
Route::middleware('collab.webhook')->group(function () {
    Route::get('collab/notes/{note}',  [CollabController::class, 'load']);
    Route::put('collab/notes/{note}', [CollabController::class, 'store']);
});
```

Implement a tiny middleware `CollabWebhookAuth` that compares
`X-Collab-Secret` to `config('services.collab.webhook_secret')` with
`hash_equals`.

`load()` returns `{ content: <tiptap json>, ydocState: <base64|null> }` —
read `notes.content` (JSONB) and `base64_encode(notes.ydoc_state)` (BYTEA).
`store()` accepts the same shape, `base64_decode`s `ydocState` back into raw
bytes before writing it to `notes.ydoc_state`, and overwrites
`notes.content` with the JSON snapshot if provided.

### Step 4 — Scaffold the Hocuspocus service

Create `collab/` at the repo root:

```
collab/
  Dockerfile
  package.json
  tsconfig.json
  src/
    index.ts
```

`collab/package.json`:

```json
{
  "name": "notetify-collab",
  "private": true,
  "type": "module",
  "scripts": {
    "dev":   "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "build": "tsc -p ."
  },
  "dependencies": {
    "@hocuspocus/server": "^2.13.0",
    "@hocuspocus/extension-redis": "^2.13.0",
    "@hocuspocus/transformer": "^2.13.0",
    "jsonwebtoken": "^9.0.2",
    "redis": "^4.7.0",
    "undici": "^6.19.8",
    "yjs": "^13.6.18"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.5.0",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/node": "^22.0.0"
  }
}
```

`collab/src/index.ts`:

```ts
import { Server } from '@hocuspocus/server';
import { Redis } from '@hocuspocus/extension-redis';
import { TiptapTransformer } from '@hocuspocus/transformer';
import jwt from 'jsonwebtoken';
import { createClient } from 'redis';
import { fetch } from 'undici';
import * as Y from 'yjs';

const {
  PORT = '1234',
  JWT_SECRET,
  WEBHOOK_SECRET,
  LARAVEL_URL = 'http://api:80',
  REDIS_HOST = 'redis',
  REDIS_PORT = '6379',
} = process.env;

if (!JWT_SECRET || !WEBHOOK_SECRET) {
  throw new Error('JWT_SECRET and WEBHOOK_SECRET are required');
}

const pub = createClient({ url: `redis://${REDIS_HOST}:${REDIS_PORT}` });
await pub.connect();

const server = new Server({
  port: Number(PORT),

  extensions: [
    new Redis({ host: REDIS_HOST, port: Number(REDIS_PORT) }),
  ],

  async onAuthenticate({ token, documentName }) {
    const payload = jwt.verify(token, JWT_SECRET) as {
      sub: string; noteId: string; role: string;
    };
    if (`note:${payload.noteId}` !== documentName) {
      throw new Error('Token does not match document');
    }
    return { user: { id: payload.sub, role: payload.role } };
  },

  async onLoadDocument({ documentName }) {
    const noteId = documentName.replace(/^note:/, '');
    const res = await fetch(`${LARAVEL_URL}/api/collab/notes/${noteId}`, {
      headers: { 'X-Collab-Secret': WEBHOOK_SECRET },
    });
    if (!res.ok) throw new Error(`load failed: ${res.status}`);
    const { ydocState } = await res.json() as { ydocState: string | null };

    const doc = new Y.Doc();
    if (ydocState) {
      Y.applyUpdate(doc, Buffer.from(ydocState, 'base64'));
    }
    return doc;
  },

  async onStoreDocument({ documentName, document, context }) {
    const noteId = documentName.replace(/^note:/, '');
    const userId = (context as { user: { id: string } }).user.id;

    const ydocState = Buffer.from(Y.encodeStateAsUpdate(document)).toString('base64');
    const content   = TiptapTransformer.fromYdoc(document);

    await fetch(`${LARAVEL_URL}/api/collab/notes/${noteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Collab-Secret': WEBHOOK_SECRET,
      },
      body: JSON.stringify({ ydocState, content }),
    });

    await pub.publish(
      `notes:user:${userId}`,
      JSON.stringify({ type: 'note.updated', noteId, at: Date.now(), by: userId }),
    );
  },

  // Reject write operations for viewer-role connections.
  async onStateless({ payload, connection }) {
    // Hocuspocus doesn't block writes based on role natively; enforce it here.
    // Viewers connect with role='viewer' in the JWT context set during onAuthenticate.
    const role = (connection.readOnly as unknown as string) ?? 'editor';
    if (role === 'viewer') {
      connection.readOnly = true;
    }
  },

  debounce: 2000,
  maxDebounce: 10000,
});

server.listen();
```

> **Viewer read-only enforcement:** Set `connection.readOnly = true` for any
> connection whose JWT `role` is `'viewer'`. Hocuspocus will still stream the
> document to the viewer and keep them in sync, but will reject any update
> messages they send. The client should also set `editable: false` on the
> Tiptap instance when the role is `'viewer'` to prevent the editor from
> accepting input in the first place.

`collab/Dockerfile`:

```dockerfile
FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install
COPY . .

FROM base AS development
EXPOSE 1234
CMD ["pnpm", "dev"]

FROM base AS production
RUN pnpm build && pnpm prune --prod
EXPOSE 1234
CMD ["pnpm", "start"]
```

### Step 5 — Add `collab` to docker-compose

Append to `docker-compose.dev.yaml`:

```yaml
  collab:
    build:
      context: ./collab
      dockerfile: Dockerfile
      target: development
    container_name: notetify-collab
    networks:
      - notetify-net
    restart: unless-stopped
    depends_on:
      redis:
        condition: service_healthy
      api:
        condition: service_healthy
    volumes:
      - ./collab:/app
      - node_modules_collab:/app/node_modules
    ports:
      - "1234:1234"
    environment:
      PORT: ${COLLAB_PORT:-1234}
      JWT_SECRET: ${COLLAB_JWT_SECRET}
      WEBHOOK_SECRET: ${COLLAB_WEBHOOK_SECRET}
      LARAVEL_URL: ${COLLAB_LARAVEL_URL:-http://api:80}
      REDIS_HOST: ${REDIS_HOST:-redis}
      REDIS_PORT: ${REDIS_PORT:-6379}
    env_file:
      - .env.development
```

And add the volume:

```yaml
volumes:
  node_modules_collab:
```

### Step 6 — Wire the React client

Install:

```bash
docker compose -f docker-compose.dev.yaml exec client \
  pnpm add @hocuspocus/provider @tiptap/extension-collaboration \
           @tiptap/extension-collaboration-cursor yjs
```

Add to `client/src/services/collab-service.ts`:

```ts
import { api } from './http'; // or whatever your axios wrapper is

export async function getCollabSession(noteId: string) {
  const { data } = await api.post(`/collab/token/${noteId}`);
  return data as { token: string; wsUrl: string; docId: string };
}
```

In the editor component (`client/src/components/editor/...`), swap the Tiptap
config to:

```ts
import { HocuspocusProvider } from '@hocuspocus/provider';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';

const ydoc = new Y.Doc();
const { token, wsUrl, docId } = await getCollabSession(noteId);

const provider = new HocuspocusProvider({
  url: wsUrl,             // ws://localhost:1234 in dev
  name: docId,            // "note:<id>"
  token,
  document: ydoc,
});

// For viewer sessions, fetch via /collab/token/:id/viewer instead,
// then set editable: false on the editor.
const isViewer = session.role === 'viewer';

const editor = new Editor({
  editable: !isViewer,
  extensions: [
    StarterKit.configure({ history: false }), // collab provides history
    Collaboration.configure({ document: ydoc }),
    CollaborationCursor.configure({
      provider,
      user: { name: currentUser.name, color: pickColor(currentUser.id) },
    }),
  ],
});
```

Add `VITE_COLLAB_WS_URL=ws://localhost:1234` to the `client` env, and use
it as the fallback if the API doesn't return `wsUrl`.

### Step 7 — Verify locally

1. `docker compose -f docker-compose.dev.yaml up --build`
2. Open the app in two browser windows (incognito + normal), log in as the
   same user, open the same note.
3. Type in window A — characters should appear in window B within ~50ms.
4. Stop typing for ~2s; check Laravel logs for the `PUT /api/collab/notes/...`
   webhook hit.
5. Reload both windows: content persists.

---

## 5. Client integration: react-query + collab split

The introduction of Hocuspocus changes **what** react-query is responsible for,
not whether you use it. The split:

| Concern | Tool | Pattern |
|---|---|---|
| Sidebar list, filters, search | react-query | `useQuery(['notes', filters])` over `GET /api/notes` |
| Note metadata mutations (tags, notebook, pin, delete, create) | react-query | `useMutation` + optimistic update + `invalidateQueries` |
| Note body edits (incl. title via H1) | `HocuspocusProvider` + Y.Doc | No react-query, no REST; Yjs *is* the optimistic update |
| Collab session token | react-query | `useQuery(['collab-session', noteId])` over `POST /api/collab/token/:id` |

Optimistic updates stay exactly as they are today for everything **except note
body**. For the body, the local `Y.Doc` mutates instantly on keystroke — that
is already an optimistic update, you don't need a second one.

### 5.1 The sidebar staleness problem

Because body flushes happen every ~2–10s and sidebar reads JSONB
(`content`, derived `title`, `updated_at`), the sidebar can show stale data
for a few seconds after a flush. Notetify uses **all three** strategies
below, layered. Each handles a different failure mode of the others:

- **C** is the primary mechanism — Hocuspocus pushes an "updated" signal to
  every connected client of that user, and react-query invalidates the
  affected keys instantly.
- **B** covers the case where C drops a message (network blip, SSE
  reconnect window, browser throttling).
- **A** is the backstop — if both C and B miss, the next focus event or the
  60s poll closes the gap.

#### A. Refetch on focus / interval (always on)

The cheapest layer. Catches most cases for free.

```ts
// client/src/services/note-service.ts (or wherever useQuery for notes lives)
useQuery({
  queryKey: ['notes', filters],
  queryFn: fetchNotes,
  refetchOnWindowFocus: true,
  staleTime: 30_000,     // treat data as fresh for 30s
  refetchInterval: 60_000, // background poll once a minute
});
```

Good defaults for a personal note app. Users tab away and back constantly;
focus refetch usually masks staleness.

#### B. Invalidate when the editor closes (always on)

When the user closes a note (unmount the editor), invalidate the list so the
sidebar reflects whatever the final flush wrote.

```ts
// client/src/components/editor/NoteEditor.tsx
import { useQueryClient } from '@tanstack/react-query';

export function NoteEditor({ noteId }: { noteId: string }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    return () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
    };
  }, [noteId, queryClient]);

  // ...rest of editor
}
```

A + B catch most things, but they don't help a passive viewer whose sidebar
is on screen while another user types in another tab/device. C closes that
gap.

#### C. Server-pushed invalidation (primary mechanism)

> **Terminology note — webhook vs SSE.** This doc uses "webhook" in one
> place only: the **server-to-server** call from Hocuspocus to Laravel
> that persists the doc (`PUT /api/collab/notes/:id`). That's a real
> webhook — a one-shot HTTP PUT between two backends.
>
> The notification described here is **not** a webhook. Browsers can't
> receive webhooks (they have no inbound URL). Instead, each browser
> opens a long-lived **Server-Sent Events (SSE)** stream to Laravel on
> app load (`GET /api/notes/stream`). Laravel keeps that connection
> open and writes one event line down it whenever a flush happens.
>
> So the chain is:
> 1. **Webhook**: Hocuspocus → Laravel (persists BYTEA + JSONB).
> 2. **Pub/sub**: Laravel publishes a tiny `note.updated` to Redis.
> 3. **SSE**: Laravel relays it down every open browser stream for that
>    user.
>
> The SSE event carries no document content — just `{ noteId, at, by }`.
> The browser uses it as a signal to invalidate react-query keys and
> refetch the JSONB normally.

After every debounced flush, Hocuspocus publishes a tiny `note.updated`
event. Each client of that user has an open SSE stream from Laravel that
relays the event. On receipt, the client invalidates the relevant
react-query keys and the sidebar re-fetches.

**The flow:**

```
  Hocuspocus                Redis            Laravel               Browser(s)
  ──────────              ─────────         ─────────             ──────────
  onStoreDocument
        │
        │  PUBLISH notes:user:<uid>
        │   { type: 'note.updated',
        │     noteId, at, by }
        ▼
        ─────────────────────►
                                SUBSCRIBE notes:user:<uid>
                                ◄──────────────────────
                                       │
                                       ▼
                                GET /api/notes/stream
                                (long-lived SSE,
                                 Sanctum-auth)
                                       │
                                       ▼
                                  event: note.updated
                                  data:  { noteId, at, by }
                                       ─────────────────────►
                                                              EventSource.onmessage
                                                                     │
                                                                     ▼
                                                       queryClient.invalidateQueries
                                                       (['notes'], ['note', noteId])
                                                                     │
                                                                     ▼
                                                       sidebar re-fetches JSONB
```

**Why SSE over a second WebSocket:**

- One-way (server → client) is exactly what we need.
- Plays cleanly with Sanctum cookies — no JWT, no extra auth path.
- Built-in auto-reconnect with `Last-Event-ID` resumption.
- No nginx WS upgrade dance needed; it's just HTTP.
- Hocuspocus already owns its WS for body sync; this stream serves the
  *list view*, not the editor, so keeping them separate is healthier.

**Server side — Hocuspocus publish.** Already included in `onStoreDocument`
in Step 4 above — the `pub.publish(...)` call at the end of the handler.

**Server side — Laravel SSE endpoint.** Add to `routes/api.php` inside the
`auth:sanctum` group:

```php
Route::get('notes/stream', [CollabController::class, 'stream']);
```

Implement in `CollabController`:

```php
public function stream(Request $request): StreamedResponse
{
    $userId = $request->user()->id;

    return response()->stream(function () use ($userId) {
        $redis = Redis::connection('default')->client();
        $channel = "notes:user:{$userId}";

        $redis->subscribe([$channel], function ($message) {
            echo "event: note.updated\n";
            echo "data: {$message}\n\n";
            ob_flush();
            flush();
        });
    }, 200, [
        'Content-Type'      => 'text/event-stream',
        'Cache-Control'     => 'no-cache',
        'X-Accel-Buffering' => 'no', // disable nginx buffering
        'Connection'        => 'keep-alive',
    ]);
}
```

Notes:
- PHP-FPM is fine for SSE if you set `output_buffering = Off` and
  `max_execution_time = 0` for this route. For higher fanout, use
  Laravel Octane (Swoole/RoadRunner) — non-blocking, holds thousands of
  open SSE connections per worker.
- Send a heartbeat (`: ping\n\n`) every 25–30 seconds in the subscribe
  loop so proxies don't kill the connection.

**Client side — `useNoteUpdates` hook.**

```ts
// client/src/hooks/useNoteUpdates.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useNoteUpdates() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const url = `${import.meta.env.VITE_BASE_URL}notes/stream`;
    const es  = new EventSource(url, { withCredentials: true });

    es.addEventListener('note.updated', (e) => {
      const { noteId } = JSON.parse((e as MessageEvent).data);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
    });

    es.onerror = () => {
      // EventSource auto-reconnects with backoff; just log and let it retry.
      console.warn('[notes/stream] reconnecting...');
    };

    return () => es.close();
  }, [queryClient]);
}
```

Mount it once at the app shell, after auth:

```tsx
// client/src/App.tsx
function AppShell() {
  useNoteUpdates();
  return <Outlet />;
}
```

**Self-echo handling.** A user typing in note X will receive their own
`note.updated` event for X. That's fine — react-query coalesces multiple
invalidations within a short window, and the editor doesn't care about the
list query. If you want to suppress self-echoes (e.g. to avoid a
redundant fetch), compare `by` to the current user id in the hook and skip
invalidation when they match.

### 5.2 Service-layer changes

Update `client/src/services/note-service.ts` so REST mutations no longer
touch body fields:

```ts
// Allowed metadata fields. Body edits go through Hocuspocus.
type NoteMetadataPatch = {
  notebookId?: string | null;
  tagIds?: string[];
  isPinned?: boolean;
};

export const updateNoteMetadata = (id: string, patch: NoteMetadataPatch) =>
  api.put(`/notes/${id}`, patch);
```

And add `client/src/services/collab-service.ts`:

```ts
export type CollabSession = { token: string; wsUrl: string; docId: string };

export const getCollabSession = (noteId: string) =>
  api.post<CollabSession>(`/collab/token/${noteId}`).then(r => r.data);
```

Use it via react-query so the token is cached and refetched correctly:

```ts
// client/src/components/editor/NoteEditor.tsx
const { data: session } = useQuery({
  queryKey: ['collab-session', noteId],
  queryFn: () => getCollabSession(noteId),
  // Refetch before JWT expiry; matches COLLAB_JWT_TTL minus a safety window.
  staleTime: 50 * 60 * 1000, // 50min, with 60min token TTL
});
```

### 5.3 Mental model summary

```
                  ┌────────────────────────────────────┐
                  │            React app               │
                  │                                    │
                  │  ┌──── useNoteUpdates() ────┐      │  ← C: SSE listener
                  │  │  EventSource             │      │     mounted at shell
                  │  │  /api/notes/stream       │      │
                  │  └─────────────┬────────────┘      │
                  │                ▼                   │
                  │     queryClient.invalidate         │
                  │                                    │
   ┌──────────────┴─────────┐            ┌─────────────┴─────────────┐
   │ Sidebar / lists        │            │ Open NoteEditor           │
   │ react-query            │            │ HocuspocusProvider+Y.Doc  │
   │ - useQuery(['notes'])  │            │ - WS to /collab           │
   │ - optimistic mutations │            │ - keystrokes = Yjs ops    │
   │   for METADATA only    │            │ - no react-query for body │
   └────────────┬───────────┘            └──────────────┬────────────┘
                │                                       │
   A: refetchOnWindowFocus + interval (backstop)        │
   B: invalidate on editor unmount (safety net)         │
                ▼                                       ▼
        Laravel REST                            Hocuspocus
        - GET  /api/notes        ◄── publishes ── onStoreDocument
        - GET  /api/notes/stream      via Redis    │
                │                                  │
                └────────────► Postgres ◄──────────┘
                     content (JSONB) + ydoc_state (BYTEA)
```

---

## 6. Production checklist

- [ ] Terminate WSS on nginx; proxy `/collab` → `collab:1234` with
      `Upgrade`/`Connection` headers and a long `proxy_read_timeout` (e.g. 1h).
- [ ] Run multiple `collab` replicas; the Redis extension handles fanout.
- [ ] Rotate `COLLAB_JWT_SECRET` and `COLLAB_WEBHOOK_SECRET` via your secret
      store; do not commit them.
- [ ] Add a Laravel policy check inside `CollabController@token` for read-only
      shares (set `role: 'viewer'` in the JWT and set `connection.readOnly = true`
      in Hocuspocus `onAuthenticate`).
- [ ] Snapshot a Tiptap JSON view of the doc on `onStoreDocument` (write to
      `notes.content` JSONB) for search indexing and non-collab consumers
      (mobile read-only, exports). The BYTEA `ydoc_state` is the source of
      truth for collab; the JSONB is a derived view.
- [ ] Lifecycle policy on the RustFS bucket: orphan-attachment cleanup for
      files no longer referenced by any note's `content`.
- [ ] Cap document size and idle timeout in Hocuspocus to bound memory.
- [ ] Add metrics: connection count, store latency, webhook failures.
- [ ] SSE: configure nginx with `proxy_buffering off;` and
      `proxy_read_timeout` ≥ 1h on `/api/notes/stream`. Send heartbeat
      comments every 25–30s from Laravel to keep proxies from idle-killing
      the stream.
- [ ] If running PHP-FPM in production, evaluate Laravel Octane
      (Swoole/RoadRunner) for the SSE endpoint — FPM workers blocked on
      `Redis::subscribe` don't scale past a few hundred concurrent users.
- [ ] When sharing lands, switch the Redis channel from
      `notes:user:<uid>` to `notes:note:<noteId>` and have Laravel/Hocuspocus
      fan out to each authorized user's stream.

---

## 7. Design decisions (v1)

These were resolved before implementation began.

| # | Question | Decision |
|---|---|---|
| 1 | Viewer-only ("share link, read-only") sessions in v1? | **Yes.** Viewer gets a live WS connection with the document fully synced but `editable: false` on Tiptap and `readOnly: true` enforced by Hocuspocus. JWT carries `role: 'viewer'`. |
| 2 | Presence avatars / cursors in v1? | **Yes, full cursors.** Use `@tiptap/extension-collaboration-cursor` with name + color for every connected user. |
| 3 | `documentName` namespace — notes only or broader? | **`note:<uuid>` permanently.** Tasks (Kanban) will be a separate future feature with its own namespace; they are not collaborative documents in v1. |
| 4 | Inline rename from the sidebar? | **No inline rename.** Title is the first H1 inside the Tiptap doc. Renaming requires opening the note and editing the H1 — same path as any other body edit. Sidebar title is read-only. |
