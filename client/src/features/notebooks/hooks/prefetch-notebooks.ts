import { queryClient } from '@/app/providers/query-provider';
import type { SortBy } from '@/shared/types';
import { notebooksQueryOptions } from '../utils/query-options';

export const prefetchNotebooks = async (
	search: string = '',
	sortBy: SortBy = 'updated_at'
) => {
	await queryClient.prefetchInfiniteQuery(
		notebooksQueryOptions(search, sortBy)
	);
};
