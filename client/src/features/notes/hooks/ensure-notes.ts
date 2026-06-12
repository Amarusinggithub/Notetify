import { queryClient } from '@/app/providers/query-provider';
import type { SortBy, PaginatedNotesResponse } from '@/shared/types';
import type { InfiniteData } from '@tanstack/react-query';
import { notesQueryOptions } from '../utils/query-options';
import type { noteQueryKeys } from '../utils/query-keys';

export const ensureNotes = (
	search: string = '',
	sortBy: SortBy = 'updated_at'
) => {
	return queryClient.ensureInfiniteQueryData<
		PaginatedNotesResponse,
		Error,
		InfiniteData<PaginatedNotesResponse>,
		ReturnType<typeof noteQueryKeys.list>,
		number
	>(notesQueryOptions(search, sortBy));
};
