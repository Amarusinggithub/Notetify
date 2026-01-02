import { create } from 'zustand';
import {
	createJSONStorage,
	devtools,
	persist,
	subscribeWithSelector,
} from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createAuthSlice, type AuthSlice } from './slices/auth-slice';
import { createNotesSlice, type NotesSlice } from './slices/notes-slice';

import {
	applyTheme,
	createThemeSlice,
	type ThemeSlice,
} from './slices/theme-slice';
import { type NotebookSlice, createNotebookSlice } from './slices/notebooks-slice';

export type StoreState = NotesSlice & AuthSlice & ThemeSlice & NotebookSlice;

export const useStore = create<StoreState>()(
	subscribeWithSelector(
		devtools(
			persist(
				immer((...args) => ({
					...createNotesSlice(...args),
					...createAuthSlice(...args),
					...createThemeSlice(...args),
					...createNotebookSlice(...args),
				})),
				{
					name: 'notetify-store',
					storage: createJSONStorage(() => localStorage),
					onRehydrateStorage: () => (state) => {
						// After rehydrate, start an auth confirmation in background
						const t = state?.theme ?? 'system';
						applyTheme(t);
						state?.confirmAuth?.();
					},
					partialize: (state) => ({
						notes: state.notes,
						notebooks: state.notebooks,
						selectedNoteId: state.selectedNoteId,
						selectedNotebookId: state.selectedNotebookId,
						searchNotes: state.searchNotes,
						sortNotesBy: state.sortNotesBy,
						searchNotebooks: state.searchNotebooks,
						sortNotebooksBy: state.sortNotebooksBy,
						theme: state.theme,
					}),
				},
			),
			{ name: 'NotetifyDevtools' },
		),
	),
);
