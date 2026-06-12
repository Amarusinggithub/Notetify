import type { Tag } from '@/shared/types';
import type { useQueryClient } from '@tanstack/react-query';
import { tagQueryKeys } from './query-keys';

type TagsType =
	| Tag[]
	| { results: Tag[] }
	| { pages: { results: Tag[] }[]; pageParams: unknown[] }
	| undefined;

/*
 Snapshot the current state of the cache so we can rollback if the mutation fails.
 */
export const snapshotTags = (
	queryClient: ReturnType<typeof useQueryClient>
) => {
	return queryClient.getQueriesData<TagsType>({
		queryKey: tagQueryKeys.all,
	});
};

/**
  Restore the cache to the previous state using the snapshot.
 */
export const restoreTags = (
	queryClient: ReturnType<typeof useQueryClient>,
	previous: [readonly unknown[], TagsType][] | undefined
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
export const updateTagsCaches = (
	queryClient: ReturnType<typeof useQueryClient>,
	updater: (oldTags: Tag[], pageIndex?: number) => Tag[]
) => {
	// Get all matching queries and update them individually
	const queries = queryClient.getQueriesData<TagsType>({
		queryKey: tagQueryKeys.all,
	});

	for (const [queryKey, oldData] of queries) {
		if (!oldData) continue;

		let newData: TagsType;

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
