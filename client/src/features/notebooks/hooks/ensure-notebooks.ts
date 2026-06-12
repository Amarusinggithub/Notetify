import { queryClient } from '@/app/providers/query-provider';
import type { InfiniteData } from '@tanstack/react-query';
import type { PaginatedNotebooksResponse, SortBy } from '@/shared/types';
import { notebooksQueryOptions } from '../utils/query-options';
import type { notebookQueryKeys } from '../utils/query-keys';

export const ensureNotebooks = (
	search: string = '',
	sortBy: SortBy = 'updated_at'
) => {
	return queryClient.ensureInfiniteQueryData<
		PaginatedNotebooksResponse,
		Error,
		InfiniteData<PaginatedNotebooksResponse>,
		ReturnType<typeof notebookQueryKeys.list>,
		number
	>(notebooksQueryOptions(search, sortBy));
};
