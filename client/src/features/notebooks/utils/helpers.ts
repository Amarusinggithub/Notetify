import type { UserNotebook } from '@/shared/types';
import type { useQueryClient } from '@tanstack/react-query';
import { notebookQueryKeys } from './query-keys';

type NotebooksType =
	| UserNotebook[]
	| { results: UserNotebook[] }
	| { pages: { results: UserNotebook[] }[]; pageParams: unknown[] }
	| undefined;

/*
 Snapshot the current state of the cache so we can rollback if the mutation fails.
 */
export const snapshotNotebooks = (
	queryClient: ReturnType<typeof useQueryClient>
) => {
	return queryClient.getQueriesData<NotebooksType>({
		queryKey: notebookQueryKeys.all,
	});
};

/**
  Restore the cache to the previous state using the snapshot.
 */
export const restoreNotebooks = (
	queryClient: ReturnType<typeof useQueryClient>,
	previous: [readonly unknown[], NotebooksType][] | undefined
) => {
	if (previous) {
		previous.forEach(([queryKey, data]) => {
			queryClient.setQueryData(queryKey, data);
		});
	}
};

/**
 Update the cache across all queries (search, pagination, etc.)
 */
export const updateNotebooksCaches = (
	queryClient: ReturnType<typeof useQueryClient>,
	updater: (oldNotebooks: UserNotebook[], pageIndex?: number) => UserNotebook[]
) => {
	// Get all matching queries and update them individually
	const queries = queryClient.getQueriesData<NotebooksType>({
		queryKey: notebookQueryKeys.all,
	});

	for (const [queryKey, oldData] of queries) {
		if (!oldData) continue;

		let newData: NotebooksType;

		// Handle if your API returns an Array directly
		if (Array.isArray(oldData)) {
			newData = updater(oldData);
		}
		// Handle infinite query data (e.g. { pages: [...], pageParams: [...] })
		else if ('pages' in oldData && Array.isArray(oldData.pages)) {
			newData = {
				...oldData,
				pages: oldData.pages.map((page, index) => ({
					...page,
					results: updater(page.results, index),
				})),
			};
		}
		// Handle if your API returns a paginated object (e.g. { results: [...] })
		else if ('results' in oldData && Array.isArray(oldData.results)) {
			newData = {
				...oldData,
				results: updater(oldData.results),
			};
		}

		if (newData) {
			queryClient.setQueryData(queryKey, newData);
		}
	}
};
