1. Note data modeling upgrades

UserNote now declares table name, fillable attributes, casts, and eager loads note. This keeps every API payload consistent without extra queries.
Timestamps like favorited_at are automatically set whenever boolean flags change. This logic lives in NoteController::buildFlagPayload.
Sorting and searching are done in SQL with safe allowlists (title, updated_at, etc.), and pagination defaults are clamped to prevent accidental 1,000-item responses.
Note content uses longText so rich HTML from Tiptap is not truncated.
Pattern: "Store derived metadata alongside mutation" - whenever an is_* flag flips, update the corresponding timestamp to make filtering easy. Also keep controllers thin by extracting helper methods.

2. Optimistic mutations and cache syncing in React

The note mutation hooks are the single source for create, update, and delete logic. They use TanStack Query's onMutate/onError hooks to snapshot caches, optimistically insert or update items, and roll back on failure.
Temporary IDs let the UI select a note instantly, then replace them with the real UUID once the server responds.
updateNote accepts { id, payload } so components only specify changed fields.
useDeleteNote immediately prunes the note from the list and store, then invalidates queries to confirm with the server.
Pattern: "Cache-first UX" - mutate the query cache and any relevant UI store together so the editor and sidebar stay in sync. Return snapshots from onMutate to roll back safely.

3. Shared state between router, store, and queries

Editor uses the route loader's initial page as the first query page, then flattens all pages into the note store. This gives every component access to the selected note without re-querying.
Notes page ensures the URL and selected note stay aligned. If no note exists it creates one, selects it, and updates the route.
Pattern: "Single note selection authority" - keep selection in the store but derive from the router when available. This avoids stale noteId params.

4. UI affordances for note editing

EditorHeader shows sharing actions, favorite toggles, delete, and note-level controls in one place.
Note cards display snippets, updated-at info, and favorite state so list views stay informative.
Sidebar search keeps raw input local, debounces network-triggering state, and updates the query key only after the user pauses.

5. Testing strategy

API feature tests cover search filters, CRUD flags, and shared-note deletion. Factories guarantee unique note and user combinations to satisfy DB constraints.
Client tests assert that fetchNotesPage builds the right query string, updateNote and deleteNote hit the right endpoints, and the card renders the favorite indicator.
Pattern: "Test behavior, not implementation." For Laravel tests, hit the JSON endpoints and assert database state. For React, mock axios once and verify the hook shapes.

6. Types and consistency

String IDs are used consistently across the client and backend, matching the Laravel UUID payloads and avoiding casing bugs.
Shared helper types like UpdateUserNotePayload keep mutation functions flexible but type-safe.

7. Transitions vs. useDeferredValue with Suspense + external stores

Symptom: a debounced search input updates a Zustand store, the queryKey of `useSuspenseInfiniteQuery` changes, and the Suspense fallback (loading skeleton) flashes between every search even though we want the previous list to stay visible until new results arrive.

Why `startTransition` does NOT fix this when the value lives in Zustand:

- `startTransition` only marks updates that go through React's own scheduler (`useState`, `useReducer`, `use`) as low-priority and interruptible. If such an update suspends, React keeps the previous UI mounted instead of falling back to Suspense.
- Zustand reads via `useSyncExternalStore`. The contract of that API is "the snapshot must always be in sync with the external store, no tearing." To honor it, React forces every external-store update to be synchronous and urgent and explicitly opts it out of transitions.
- So `startTransition(() => setSearch(...))` calls Zustand's setState, notifies subscribers, schedules synchronous urgent renders, queryKey changes, useSuspenseInfiniteQuery suspends, Suspense unmounts to the fallback. The wrapper is silently ignored.

Why `useDeferredValue` DOES fix it:

- It operates on a value, not on an update. Sequence:
  1. Zustand commits the new search synchronously (we can't stop that).
  2. The component re-renders and reads the new search from the store.
  3. `useDeferredValue(search)` returns the OLD search for this render. React then schedules a second render in the background with the new search.
  4. The background render hits `useSuspenseInfiniteQuery` with the new queryKey and suspends.
  5. A suspension during a deferred render does NOT trigger the Suspense fallback — React keeps showing the previous render's output until the new render's data is ready.
  6. Once the query resolves, React commits the new render. No skeleton flash.

Pattern: "Transitions are for state you write through React's setters; useDeferredValue is for values that come from external stores." Whenever a suspending value originates from Zustand, Redux, or any other `useSyncExternalStore`-backed source, reach for `useDeferredValue` at the read site, not `startTransition` at the write site.

Bonus pattern from the same fix: isolate the input's local state in its own subcomponent so each keystroke only re-renders the input, not the whole sidebar tree (filters, dropdowns, count, list). Subscribe child components directly to the store rather than threading the value through the parent — that way the parent doesn't need to subscribe at all.

How to apply these patterns yourself

State normalization: Define your domain types once. Whenever you feel the urge to update local state and the query cache separately, extract a helper so every mutation follows the same shape.
Optimistic UIs: Use TanStack Query's onMutate to snapshot, mutate, and roll back. Pair it with a UI store only when multiple components need the same state.
Testing: For Laravel, factories plus feature tests give end-to-end confidence. For React hooks, mock axios or fetch and assert the API calls; for components, render with Testing Library and interact the way a user would.
Debounce/search: Keep the raw input local, debounce before touching global state or the network. This avoids double renders and wasted requests.
