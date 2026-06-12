import type { StoreState } from '@/app/store/index';
import type { StateCreator } from 'zustand';
import type { SortBy, Tag } from '@/shared/types';

export type TagSliceState = {
	selectedTagId: string | null;
	selectedTag: Tag | null;
	wantToEditTag: boolean;
	wantToDeleteTag: boolean;
	searchTags: string;
	sortTagsBy: SortBy;
};

export type TagSliceActions = {
	setSelectedTagId: (id: string | null) => void;
	setSelectedTag: (tag: Tag | null) => void;
	setWantToEditTag: (v: boolean) => void;
	setWantToDeleteTag: (v: boolean) => void;
	setTagSearch: (q: string) => void;
	setTagSortBy: (s: SortBy) => void;
};

export type TagSlice = TagSliceState & TagSliceActions;

export const createTagSlice: StateCreator<StoreState, [], [], TagSlice> = (
	set
) => ({
	selectedTagId: null,
	selectedTag: null,
	wantToEditTag: false,
	wantToDeleteTag: false,
	searchTags: '',
	sortTagsBy: 'updated_at',
	setSelectedTagId: (id: string | null) => set({ selectedTagId: id }),
	setSelectedTag: (tag: Tag | null) =>
		set({ selectedTag: tag, selectedTagId: tag?.id ?? null }),
	setWantToEditTag: (v: boolean) => set({ wantToEditTag: v }),
	setWantToDeleteTag: (v: boolean) => set({ wantToDeleteTag: v }),
	setTagSearch: (q: string) => set({ searchTags: q }),
	setTagSortBy: (s: SortBy) => set({ sortTagsBy: s }),
});
