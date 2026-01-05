import type { SortBy } from "../types";

export const noteQueryKeys = {
	all: ['notes'] as const,
	list: (search: string, sortBy: SortBy) =>
		[...noteQueryKeys.all, search, sortBy] as const,
};

export const tagQueryKeys = {
	all: ['tags'] as const,
	list: (category: string, params: string) =>
		[...tagQueryKeys.all, category, params] as const,
};

export const notebookQueryKeys = {
	all: ['notebooks'] as const,
	lists: () => [...notebookQueryKeys.all, 'lists'] as const,
	list: (category: string, params: string) =>
		[...notebookQueryKeys.lists(), category, params] as const,
};

export const spaceQueryKeys = {
	all: ['spaces'] as const,
	lists: () => [...spaceQueryKeys.all, 'lists'] as const,
	list: (category: string, params: string) =>
		[...spaceQueryKeys.lists(), category, params] as const,
};

export const fileQueryKeys = {
	all: ['files'] as const,
	lists: () => [...fileQueryKeys.all, 'lists'] as const,
	list: (category: string, params: string) =>
		[...fileQueryKeys.lists(), category, params] as const,
};

export const taskQueryKeys = {
	all: ['tasks'] as const,
	lists: () => [...taskQueryKeys.all, 'lists'] as const,
	list: (category: string, params: string) =>
		[...taskQueryKeys.lists(), category, params] as const,
};

export const calendarQueryKeys = {
	all: ['calendar'] as const,
	lists: () => [...calendarQueryKeys.all, 'lists'] as const,
	list: (category: string, params: string) =>
		[...calendarQueryKeys.lists(), category, params] as const,
};
