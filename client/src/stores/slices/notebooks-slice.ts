import type { StoreState } from 'stores';
import type { StateCreator } from 'zustand';

type SortBy = 'updated_at' | 'created_at' | 'title';

export type NotebookSliceState = {
	selectedNotebookId: string | null;
	searchNotebooks: string;
	sortNotebooksBy: SortBy;
};

export type NotebookSliceActions = {
	setSelectedNotebook: (id: string | null) => void;


	setNotebookSearch: (q: string) => void;
	setNotebookSortBy: (s: SortBy) => void;
};

export type NotebookSlice = NotebookSliceState & NotebookSliceActions;

export const createNotebookSlice: StateCreator<
	StoreState,
	[],
	[],
	NotebookSlice
> = (set) => ({
	selectedNotebookId: null,
	searchNotebooks: '',
	sortNotebooksBy: 'updated_at',
	setSelectedNotebook: (id: string | null) => set({ selectedNotebookId: id }),

	setNotebookSearch: (q: string) => set({ searchNotebooks: q }),
	setNotebookSortBy: (s: SortBy) => set({ sortNotebooksBy: s }),
});


/*
upsertNotebook: (
		notebook?: UserNotebook,
		payload?: UpdateUserNotebookPayload,
		id?: string,
	) => {
		const existing = get().notebooks;
		const idx = existing.findIndex(
			(n: UserNotebook) =>
				n.id ===
				(notebook != null && notebook != undefined ? notebook?.id : id),
		);

		if (notebook != null && notebook != undefined) {
			if (idx >= 0) {
				const next = existing.slice();
				next[idx] = notebook;
				set({ notebooks: next });
			} else {
				set({ notebooks: [notebook, ...existing] });
			}
		}

		if (
			payload != null &&
			payload != undefined &&
			id != null &&
			id != undefined
		) {
			if (idx >= 0) {
				const next = existing.slice();
				const existingNotebook = next[idx];

				next[idx] = {
					...existingNotebook,
					...payload,
				};

				set({ notebooks: next });
			}
		}
	},
*/
