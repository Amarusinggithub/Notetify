import type { SortBy } from '../types';

export const noteQueryKeys = {
	detail: (noteId: string) => [noteId],
	all: ['notes'] as const,
	list: (search: string, sortBy: SortBy) =>
		[...noteQueryKeys.all, search, sortBy] as const,
};

export const tagQueryKeys = {
	detail: (tagId: string) => [tagId],

	all: ['tags'] as const,
	list: (search: string, sortBy: SortBy) =>
		[...tagQueryKeys.all, search, sortBy] as const,
};

export const notebookQueryKeys = {
	detail: (notebookId: string) => [notebookId],

	all: ['notebooks'] as const,
	list: (search: string, sortBy: SortBy) =>
		[...notebookQueryKeys.all, search, sortBy] as const,
};

export const spaceQueryKeys = {
	detail: (spaceId: string) => [spaceId],

	all: ['spaces'] as const,
	list: (search: string, sortBy: SortBy) =>
		[...spaceQueryKeys.all, search, sortBy] as const,
};

export const fileQueryKeys = {
	detail: (fileId: string) => [fileId],

	all: ['files'] as const,
	list: (search: string, sortBy: SortBy) =>
		[...fileQueryKeys.all, search, sortBy] as const,
};

export const taskQueryKeys = {
	detail: (taskId: string) => [taskId],

	all: ['tasks'] as const,
	list: (search: string, sortBy: SortBy) =>
		[...taskQueryKeys.all, search, sortBy] as const,
};

export const eventQueryKeys = {
	detail: (eventId: string) => [eventId],

	all: ['events'] as const,
	list: (search: string, sortBy: SortBy) =>
		[...eventQueryKeys.all, search, sortBy] as const,
};
