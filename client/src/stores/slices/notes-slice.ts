import type { StoreState } from 'stores';
import type { StateCreator } from 'zustand';
import type { SortBy } from '../../types';

export type NotesSliceState = {
	selectedNoteId: string | null;

	searchNotes: string;
	sortNotesBy: SortBy;
};

export type NotesSliceActions = {
	setSelectedNoteId: (id: string | null) => void;
	setSearch: (q: string) => void;
	setSortBy: (s: SortBy) => void;
};

export type NotesSlice = NotesSliceState & NotesSliceActions;

export const createNotesSlice: StateCreator<StoreState, [], [], NotesSlice> = (
	set
) => ({
	selectedNoteId: null,
	notes: [],
	searchNotes: '',
	sortNotesBy: 'updated_at',
	setSelectedNoteId: (id: string | null) => set({ selectedNoteId: id }),
	setSearch: (q: string) => set({ searchNotes: q }),
	setSortBy: (s: SortBy) => set({ sortNotesBy: s }),
});
