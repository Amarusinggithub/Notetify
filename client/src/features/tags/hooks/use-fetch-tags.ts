import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import type { SortBy } from '@/shared/types';
import { tagsQueryOptions } from '../utils/query-options';

export const useFetchTags = (
	search: string = '',
	sortBy: SortBy = 'updated_at'
) => {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSuspenseInfiniteQuery(tagsQueryOptions(search, sortBy));
	return { data, fetchNextPage, hasNextPage, isFetchingNextPage };
};
