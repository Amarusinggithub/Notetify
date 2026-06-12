import type { SortBy } from '@/shared/types';

export const noteQueryKeys = {
	all: ['notes'] as const,
	detail: (noteId: string) => [...noteQueryKeys.all, 'detail', noteId] as const,
	list: (search: string, sortBy: SortBy) =>
		[...noteQueryKeys.all, 'list', search, sortBy] as const,
};

