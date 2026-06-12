import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import type { SortBy } from '@/shared/types';
import { notebooksQueryOptions } from '../utils/query-options';

export const useFetchNotebooks = (
	search: string = '',
	sortBy: SortBy = 'updated_at'
) => {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSuspenseInfiniteQuery(notebooksQueryOptions(search, sortBy));
	return { data, fetchNextPage, hasNextPage, isFetchingNextPage };
};
