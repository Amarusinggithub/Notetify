import { create } from 'zustand';
import type { UserNote } from '../types';

type SortBy = 'updated_at' | 'created_at' | 'title';

type NotesState = {
  selectedNoteId: string | null;
  notes: UserNote[];
  search: string;
  sortBy: SortBy;
  setSelectedNote: (id: string | null) => void;
  setNotes: (notes: UserNote[]) => void;
  upsertNote: (note: UserNote) => void;
  removeNote: (id: string) => void;
  setSearch: (q: string) => void;
  setSortBy: (s: SortBy) => void;
};

export const useNotesStore = create<NotesState>((set, get) => ({
  selectedNoteId: null,
  notes: [],
  search: '',
  sortBy: 'updated_at',
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
  removeNote: (id) =>
    set((state) => {
      const remaining = state.notes.filter((note) => note.id !== id);
      const selectedNoteId = state.selectedNoteId === id ? (remaining[0]?.id ?? null) : state.selectedNoteId;
      return { notes: remaining, selectedNoteId };
    }),
  setSearch: (q) => set({ search: q }),
  setSortBy: (s) => set({ sortBy: s }),
}));
