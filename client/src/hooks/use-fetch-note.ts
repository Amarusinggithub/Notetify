import {

	useSuspenseInfiniteQuery,
	useSuspenseQuery,
	type InfiniteData,
} from '@tanstack/react-query';
import { queryClient } from '../App';
import { fetchNote, fetchNotesPage } from '../services/note-service';
import type { PaginatedNotesResponse, SortBy } from '../types';
import { noteQueryKeys } from '../utils/queryKeys';

export const notesQueryOptions = (
	search: string = '',
	sortby: SortBy = 'updated_at',
) => ({
	queryKey: noteQueryKeys.list(search, sortby),
	queryFn: fetchNotesPage,
	initialPageParam: 1,
	getNextPageParam: (lastPage: PaginatedNotesResponse) => lastPage.nextPage,
});

export const noteQueryOptions = (noteId: string) => ({
	queryKey: noteQueryKeys.detail(noteId),
	queryFn: fetchNote,
});

export const useFetchNote = (
	noteId: string,
) => {
	const { data } =
		useSuspenseQuery(noteQueryOptions(noteId));
	return { data };
};


export const useFetchNotes = (
	search: string = '',
	sortBy: SortBy = 'updated_at',
) => {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSuspenseInfiniteQuery(notesQueryOptions(search, sortBy));
	return { data, fetchNextPage, hasNextPage, isFetchingNextPage };
};

export const prefetchNotes = (
	search: string = '',
	sortBy: SortBy = 'updated_at',
) => {
	queryClient.prefetchInfiniteQuery(notesQueryOptions(search, sortBy));
};

export const EnsureNotes = (
	search: string = '',
	sortBy: SortBy = 'updated_at',
) => {
	return queryClient.ensureInfiniteQueryData<
		PaginatedNotesResponse,
		Error,
		InfiniteData<PaginatedNotesResponse>,
		ReturnType<typeof noteQueryKeys.list>,
		number
	>(notesQueryOptions(search, sortBy));
};
