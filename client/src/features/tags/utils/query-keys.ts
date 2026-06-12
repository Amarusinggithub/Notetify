import type { SortBy } from '@/shared/types';

export const tagQueryKeys = {
	all: ['tags'] as const,
	detail: (tagId: string) => [...tagQueryKeys.all, 'detail', tagId] as const,
	list: (search: string, sortBy: SortBy) =>
		[...tagQueryKeys.all, 'list', search, sortBy] as const,
};
