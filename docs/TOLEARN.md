1. Liveblocks authentication flow

Why: Never ship a public API key in the browser for production. Instead, the client asks your backend for a short‑lived access token scoped to the current room.
How:
Added LiveblocksController that validates the room name, reads the secret from config/services.php, and POSTs to /v2/authorize-user.
Env vars (LIVEBLOCKS_SECRET_KEY, LIVEBLOCKS_BASE_URI) flow from .env\* → config/services.php.
API route /api/liveblocks/auth sits behind Sanctum auth.
Frontend Notes page now passes authEndpoint to LiveblocksProvider and resolves collaborators with resolveUsers.
Pattern: “Backend proxy for third‑party auth” — always centralize tokens on the server and hide vendor secrets. Test with HTTP fakes to avoid real API calls. 2. Note data modeling upgrades

UserNote now declares table name, fillable attributes, casts, and eager loads note. This keeps every API payload consistent without extra queries.
Timestamps like favorited*at are automatically set whenever boolean flags change. This logic lives in NoteController::buildFlagPayload.
Sorting/searching is done in SQL with safe allowlists (title, updated_at, etc.), and pagination defaults are clamped to prevent accidental 1,000-item responses.
Note content column switched to longText so rich HTML from Tiptap isn’t truncated.
Pattern: “Store derived metadata alongside mutation” — whenever an is*\* flag flips, update the corresponding timestamp to make filtering easy. Also, keep controllers thin by extracting helper methods (buildFlagPayload). 3. Optimistic mutations & cache syncing in React

use-mutate-note.tsx is now the single source for create/update/delete logic. It uses TanStack Query’s onMutate/onError hooks to snapshot caches, optimistically insert/update items, and roll back on failure.
Temporary IDs (temp-${Date.now()}) let the UI select a note instantly, then replace with the real UUID once the server responds.
updateNote mutation accepts {id, payload} so components only specify changed fields.
useDeleteNote immediately prunes the note from the list/store, then invalidates queries to confirm with the server.
Pattern: “Cache-first UX” — always mutate the query cache and any relevant Zustand store together so Editor + Sidebar stay in sync. Return snapshots from onMutate to roll back safely. 4. Shared state between router, store, and queries

Editor uses the route loader’s initial page as the first query page, then flattens all pages into useNotesStore. This gives every component (cards, header, etc.) access to the selected note without re-querying.
Notes page ensures the URL, store, and Liveblocks room stay aligned. If no note exists it creates one, selects it, and updates the route — a single source of truth.
Pattern: “Single note selection authority” — keep selection in Zustand but derive from the router when available. This avoids stale noteId params and ensures collaboration rooms use the correct ID. 5. UI affordances for collaboration

EditorHeader now shows title editing, favorite toggle, delete, and presence badges powered by useOthers. Title edits call useUpdateNote with debouncing so you don’t spam the API on every keypress.
NoteCard displays snippets, updated-at info, and a favorite star. Useful when multiple people are editing and you need context quickly.
Sidebar search uses useDebounce to delay network calls, keeps input local state, and pushes the debounced value into the store/query key. 6. Testing strategy

API: Feature tests cover search filters, CRUD flags, shared-note deletion, and Liveblocks token proxying. Factories guarantee unique note/user combinations to satisfy DB constraints.
Client: Vitest specs now assert that fetchNotesPage builds the right query string, updateNote/deleteNote hit the right endpoints, and the card renders the favorite indicator. (Existing auth page tests still need their mocks fixed — noted separately.)
Pattern: “Test behavior, not implementation.” For Laravel tests, hit the JSON endpoints and assert database state (using assertSoftDeleted). For React, mock axios once and verify the hook shapes.

7. Types & consistency

Switched to string IDs everywhere (Laravel UUIDs) and renamed every is_favorite to is_favorite to match the backend payload. Keeps TypeScript honest and prevents subtle casing bugs.
Shared helper types like UpdateUserNotePayload make mutation functions flexible but type-safe.
How to apply these patterns yourself

Secure integrations: Whenever a JS SDK offers both public keys and server-side secrets, start with the secret-backed flow. Build a tiny controller that proxies auth.
State normalization: Define your domain types once (UserNote, Note). Whenever you feel the urge to setState and queryClient.setQueryData, extract a helper so every mutation follows the same shape.
Optimistic UIs: Use TanStack Query’s onMutate to snapshot, mutate, and roll back. Pair it with a UI store (Zustand/redux) only when multiple components need the same state.
Testing: For Laravel, factories + feature tests give end-to-end confidence. For React hooks, mock axios/fetch and assert you called the API correctly; for components, render with Testing Library and interact the way a user would.
Debounce/search: Keep the raw input local, debounce before touching global state or network. This avoids double renders and wasted requests.


