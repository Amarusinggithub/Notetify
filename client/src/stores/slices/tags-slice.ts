import type { StoreState } from 'stores';
import type { SortBy } from '../../types';
import type { StateCreator } from 'zustand';

export type TagSliceState = {
	selectedTagId: string | null;
	searchTags: string;
	sortTagsBy: SortBy;
};

export type TagSliceActions = {
	setSelectedTagId: (id: string | null) => void;
	setTagSearch: (q: string) => void;
	setTagSortBy: (s: SortBy) => void;
};

export type TagSlice = TagSliceState & TagSliceActions;

export const createTagSlice: StateCreator<
	StoreState,
	[],
	[],
	TagSlice
> = (set) => ({
	selectedTagId: null,
	searchTags: '',
	sortTagsBy: 'updated_at',
	setSelectedTagId: (id: string | null) => set({ selectedTagId: id }),
	setTagSearch: (q: string) => set({ searchTags: q }),
	setTagSortBy: (s: SortBy) => set({ sortTagsBy: s }),
});
