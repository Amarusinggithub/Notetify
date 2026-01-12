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
	createNotebookSlice,
	type NotebookSlice,
} from './slices/notebooks-slice';
import { createTagSlice, type TagSlice } from './slices/tags-slice';
import {
	applyTheme,
	createThemeSlice,
	type ThemeSlice,
} from './slices/theme-slice';

export type StoreState = NotesSlice &
	AuthSlice &
	ThemeSlice &
	NotebookSlice &
	TagSlice;

export const useStore = create<StoreState>()(
	subscribeWithSelector(
		devtools(
			persist(
				immer((...args) => ({
					...createNotesSlice(...args),
					...createAuthSlice(...args),
					...createThemeSlice(...args),
					...createNotebookSlice(...args),
					...createTagSlice(...args),
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
						selectedNoteId: state.selectedNoteId,
						selectedNotebookId: state.selectedNotebookId,
						selectedTagId: state.selectedTagId,
						searchNotes: state.searchNotes,
						sortNotesBy: state.sortNotesBy,
						searchNotebooks: state.searchNotebooks,
						sortNotebooksBy: state.sortNotebooksBy,
						searchTags: state.searchTags,
						sortTagsBy: state.sortTagsBy,
						theme: state.theme,
						language: state.language,
						sharedData: state.sharedData,
						isAuthenticated: state.isAuthenticated,
					}),
				}
			),
			{ name: 'NotetifyDevtools' }
		)
	)
);
