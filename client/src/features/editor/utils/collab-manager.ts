import { HocuspocusProvider, HocuspocusProviderWebsocket } from '@hocuspocus/provider';
import * as Y from 'yjs';
import type { CollabSession } from '../services/collab-service';

export interface CollabEntry {
	ydoc: Y.Doc;
	provider: HocuspocusProvider;
}

// How many recently-opened documents stay connected. The active note is always
// the most-recently-used entry, so it is never the one evicted.
const MAX_WARM = 10;

let socket: HocuspocusProviderWebsocket | null = null;
let socketUrl: string | null = null;

// Insertion order doubles as LRU order: the first key is the least recently used.
const entries = new Map<string, CollabEntry>();

const getSocket = (url: string): HocuspocusProviderWebsocket => {
	if (!socket || socketUrl !== url) {
		socket?.destroy();
		socket = new HocuspocusProviderWebsocket({ url });
		socketUrl = url;
	}
	return socket;
};

export const releaseCollab = (noteId: string): void => {
	const entry = entries.get(noteId);
	if (!entry) return;
	entries.delete(noteId);
	entry.provider.destroy();
	entry.ydoc.destroy();
};

const evictStale = (): void => {
	while (entries.size > MAX_WARM) {
		const oldest = entries.keys().next().value;
		if (oldest === undefined) break;
		releaseCollab(oldest);
	}
};

export const acquireCollab = (
	noteId: string,
	session: CollabSession
): CollabEntry => {
	const existing = entries.get(noteId);
	if (existing) {
		// Re-insert to bump to most-recently-used.
		entries.delete(noteId);
		entries.set(noteId, existing);
		return existing;
	}

	const ydoc = new Y.Doc();
	const provider = new HocuspocusProvider({
		websocketProvider: getSocket(session.wsUrl),
		name: session.docId,
		token: session.token,
		document: ydoc,
	});
	// With a shared websocketProvider, `manageSocket` is false, so the provider
	// constructor does not auto-attach. Without attaching, `startSync` never runs
	// and the document stays unsynced. Attach explicitly.
	provider.attach();

	const entry: CollabEntry = { ydoc, provider };
	entries.set(noteId, entry);
	evictStale();
	return entry;
};
