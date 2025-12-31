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

export type StoreState = NotesSlice & AuthSlice & ThemeSlice;

export const useStore = create<StoreState>()(
	subscribeWithSelector(
		devtools(
			persist(
				immer((...args) => ({
					...createNotesSlice(...args),
					...createAuthSlice(...args),
					...createThemeSlice(...args),
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
						selectedNoteId: state.selectedNoteId,
						search: state.search,
						sortBy: state.sortBy,
						theme: state.theme,
					}),
				},
			),
			{ name: 'NotetifyDevtools' },
		),
	),
);
