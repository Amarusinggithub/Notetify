import type { Editor } from '@tiptap/react';
import type { StoreState } from 'stores';
import type { StateCreator } from 'zustand';
import type { UpdateUserNotePayload, UserNote } from '../../types';

type SortBy = 'updated_at' | 'created_at' | 'title';

export type NotesSliceState = {
	selectedNoteId: string | null;
	notes: UserNote[];
	editor: Editor | null;
	search: string;
	sortBy: SortBy;
};

export type NotesSliceActions = {
	setSelectedNote: (id: string | null) => void;
	setNotes: (notes: UserNote[]) => void;
	upsertNote: (note?: UserNote, payload?: UpdateUserNotePayload,id?:string)=> void;

	removeNote: (noteId: string) => void;

	setSearch: (q: string) => void;
	setSortBy: (s: SortBy) => void;
	setEditor: (e: Editor | null) => void;
};

export type NotesSlice = NotesSliceState & NotesSliceActions;

export const createNotesSlice: StateCreator<StoreState, [], [], NotesSlice> = (
	set,
	get,
) => ({
	selectedNoteId: null,
	notes: [],
	search: '',
	sortBy: 'updated_at',
	editor: null,
	setEditor: (e: Editor | null) => set({ editor: e }),
	setSelectedNote: (id: string | null) => set({ selectedNoteId: id }),
	setNotes: (notes: UserNote[]) => set({ notes }),
	removeNote: (noteId: string) => {
		const existing = get().notes;
		const idx = existing.findIndex((n: UserNote) => n.id == noteId);
		if (idx >= 0) {
			const newList = [
				...existing.slice(0, idx), // Elements before the index
				...existing.slice(idx + 1), // Elements after the index
			];
			set({ notes: newList });
		}
	},
	upsertNote: (
		note?: UserNote,
		payload?: UpdateUserNotePayload,
		id?: string
	) => {

		const existing = get().notes;
		const idx = existing.findIndex((n: UserNote) => n.id === (note!=null && note!= undefined?note?.id:id));

 if (note != null && note != undefined) {
		if (idx >= 0) {
			const next = existing.slice();
			next[idx] = note;
			set({ notes: next });
		} else {
			set({ notes: [note, ...existing] });
		}
 }

 if(payload != null && payload != undefined && id != null && id != undefined){
    if (payload)
 }


	},
	setSearch: (q: string) => set({ search: q }),
	setSortBy: (s: SortBy) => set({ sortBy: s }),
});
