import type { PaginatedNotebooksResponse, SortBy } from '@/shared/types';
import {
	fetchNotebook,
	fetchNotebooksPage,
} from '../services/notebook-service';
import { notebookQueryKeys } from './query-keys';

export const notebooksQueryOptions = (
	search: string = '',
	sortby: SortBy = 'updated_at'
) => ({
	queryKey: notebookQueryKeys.list(search, sortby),
	queryFn: fetchNotebooksPage,
	initialPageParam: 1,
	getNextPageParam: (lastPage: PaginatedNotebooksResponse) =>
		lastPage.nextPage,
});

export const notebookQueryOptions = (notebookId: string) => ({
	queryKey: notebookQueryKeys.detail(notebookId),
	queryFn: fetchNotebook,
});
