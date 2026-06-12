import type { PaginatedTagsResponse, SortBy } from '@/shared/types';
import { fetchTag, fetchTagsPage } from '../services/tag-service';
import { tagQueryKeys } from './query-keys';

export const tagsQueryOptions = (
	search: string = '',
	sortby: SortBy = 'updated_at'
) => ({
	queryKey: tagQueryKeys.list(search, sortby),
	queryFn: fetchTagsPage,
	initialPageParam: 1,
	getNextPageParam: (lastPage: PaginatedTagsResponse) => lastPage.nextPage,
});

export const tagQueryOptions = (tagId: string) => ({
	queryKey: tagQueryKeys.detail(tagId),
	queryFn: fetchTag,
});
