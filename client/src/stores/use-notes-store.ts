import { create } from 'zustand';
import type { UserNote } from '../types';
import type { Editor } from '@tiptap/react';


type SortBy = 'updated_at' | 'created_at' | 'title';

type NotesStoreState = {
	selectedNoteId: number | null;
	notes: UserNote[];
	editor: Editor | null;
	search: string;
	sortBy: SortBy;
	setSelectedNote: (id: number | null) => void;
	setNotes: (notes: UserNote[]) => void;
	upsertNote: (note: UserNote) => void;
	setSearch: (q: string) => void;
	setSortBy: (s: SortBy) => void;
	setEditor: (e: Editor | null) => void;
};

export const useNotesStore = create<NotesStoreState>((set, get) => ({
	selectedNoteId: null,
	notes: [],
	search: '',
	sortBy: 'updated_at',
	editor: null,
	setEditor: (e) => set({ editor: e }),
	setSelectedNote: (id) => set({ selectedNoteId: id }),
	setNotes: (notes) => set({ notes }),
	upsertNote: (note) => {
		const existing = get().notes;
		const idx = existing.findIndex((n) => n.id === note.id);
		if (idx >= 0) {
			const next = existing.slice();
			next[idx] = note as UserNote;
			set({ notes: next });
		} else {
			set({ notes: [note as UserNote, ...existing] });
		}
	},
	setSearch: (q) => set({ search: q }),
	setSortBy: (s) => set({ sortBy: s }),
}));
