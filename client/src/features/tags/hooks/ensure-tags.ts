import { queryClient } from '@/app/providers/query-provider';
import type { InfiniteData } from '@tanstack/react-query';
import type { PaginatedTagsResponse, SortBy } from '@/shared/types';
import { tagsQueryOptions } from '../utils/query-options';
import type { tagQueryKeys } from '../utils/query-keys';

export const ensureTags = (
	search: string = '',
	sortBy: SortBy = 'updated_at'
) => {
	return queryClient.ensureInfiniteQueryData<
		PaginatedTagsResponse,
		Error,
		InfiniteData<PaginatedTagsResponse>,
		ReturnType<typeof tagQueryKeys.list>,
		number
	>(tagsQueryOptions(search, sortBy));
};
