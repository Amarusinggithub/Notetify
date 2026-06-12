import { queryClient } from '@/app/providers/query-provider';
import type { SortBy } from '@/shared/types';
import { tagsQueryOptions } from '../utils/query-options';

export const prefetchTags = async (
	search: string = '',
	sortBy: SortBy = 'updated_at'
) => {
	await queryClient.prefetchInfiniteQuery(tagsQueryOptions(search, sortBy));
};
