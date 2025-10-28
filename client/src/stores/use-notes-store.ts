import { create } from 'zustand';

type SortBy = 'updated_at' | 'created_at';

type NotesState = {
  selectedNoteId: string | null;
  search: string;
  sortBy: SortBy;
  setSelectedNote: (id: string | null) => void;
  setSearch: (q: string) => void;
  setSortBy: (s: SortBy) => void;
};

export const useNotesStore = create<NotesState>((set) => ({
  selectedNoteId: null,
  search: '',
  sortBy: 'updated_at',
  setSelectedNote: (id) => set({ selectedNoteId: id }),
  setSearch: (q) => set({ search: q }),
  setSortBy: (s) => set({ sortBy: s }),
}));

