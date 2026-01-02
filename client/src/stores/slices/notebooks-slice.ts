import type { StoreState } from 'stores';
import type { StateCreator } from 'zustand';
import type { UpdateUserNotebookPayload, UserNotebook } from '../../types';

type SortBy = 'updated_at' | 'created_at' | 'title';

export type NotebookSliceState = {
	selectedNotebookId: string | null;
	notebooks: UserNotebook[];
	searchNotebooks: string;
	sortNotebooksBy: SortBy;
};

export type NotebookSliceActions = {
	setSelectedNotebook: (id: string | null) => void;
	setNotebooks: (notes: UserNotebook[]) => void;
	upsertNotebook: (
		notebook?: UserNotebook,
		payload?: UpdateUserNotebookPayload,
		id?: string,
	) => void;

	removeNotebook: (notebookId: string) => void;

	setNotebookSearch: (q: string) => void;
	setNotebookSortBy: (s: SortBy) => void;
};

export type NotebookSlice = NotebookSliceState & NotebookSliceActions;

export const createNotebookSlice: StateCreator<
	StoreState,
	[],
	[],
	NotebookSlice
> = (set, get) => ({
	selectedNotebookId: null,
	notebooks: [],
	searchNotebooks: '',
	sortNotebooksBy: 'updated_at',
	setSelectedNotebook: (id: string | null) => set({ selectedNotebookId: id }),
	setNotebooks: (notebooks: UserNotebook[]) => set({ notebooks }),
	removeNotebook: (notebookId: string) => {
		const existing = get().notebooks;
		const idx = existing.findIndex((n: UserNotebook) => n.id == notebookId);
		if (idx >= 0) {
			const newList = [
				...existing.slice(0, idx), // Elements before the index
				...existing.slice(idx + 1), // Elements after the index
			];
			set({ notebooks: newList });
		}
	},
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
	setNotebookSearch: (q: string) => set({ searchNotebooks: q }),
	setNotebookSortBy: (s: SortBy) => set({ sortNotebooksBy: s }),
});
