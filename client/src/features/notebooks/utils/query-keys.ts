import type { SortBy } from '@/shared/types';

export const notebookQueryKeys = {
	all: ['notebooks'] as const,
	detail: (notebookId: string) =>
		[...notebookQueryKeys.all, 'detail', notebookId] as const,
	list: (search: string, sortBy: SortBy) =>
		[...notebookQueryKeys.all, 'list', search, sortBy] as const,
};
