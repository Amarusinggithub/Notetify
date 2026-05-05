import type { SortBy } from '@/types';

export const noteQueryKeys = {
	all: ['notes'] as const,
	detail: (noteId: string) => [...noteQueryKeys.all, 'detail', noteId] as const,
	list: (search: string, sortBy: SortBy) =>
		[...noteQueryKeys.all, 'list', search, sortBy] as const,
};

export const tagQueryKeys = {
	all: ['tags'] as const,
	detail: (tagId: string) => [...tagQueryKeys.all, 'detail', tagId] as const,
	list: (search: string, sortBy: SortBy) =>
		[...tagQueryKeys.all, 'list', search, sortBy] as const,
};

export const notebookQueryKeys = {
	all: ['notebooks'] as const,
	detail: (notebookId: string) =>
		[...notebookQueryKeys.all, 'detail', notebookId] as const,
	list: (search: string, sortBy: SortBy) =>
		[...notebookQueryKeys.all, 'list', search, sortBy] as const,
};

export const spaceQueryKeys = {
	all: ['spaces'] as const,
	detail: (spaceId: string) =>
		[...spaceQueryKeys.all, 'detail', spaceId] as const,
	list: (search: string, sortBy: SortBy) =>
		[...spaceQueryKeys.all, 'list', search, sortBy] as const,
};

export const fileQueryKeys = {
	all: ['files'] as const,
	detail: (fileId: string) =>
		[...fileQueryKeys.all, 'detail', fileId] as const,
	list: (search: string, sortBy: SortBy) =>
		[...fileQueryKeys.all, 'list', search, sortBy] as const,
};

export const taskQueryKeys = {
	all: ['tasks'] as const,
	detail: (taskId: string) =>
		[...taskQueryKeys.all, 'detail', taskId] as const,
	list: (search: string, sortBy: SortBy) =>
		[...taskQueryKeys.all, 'list', search, sortBy] as const,
};

export const eventQueryKeys = {
	all: ['events'] as const,
	detail: (eventId: string) =>
		[...eventQueryKeys.all, 'detail', eventId] as const,
	list: (search: string, sortBy: SortBy) =>
		[...eventQueryKeys.all, 'list', search, sortBy] as const,
};
