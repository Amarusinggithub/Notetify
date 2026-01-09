import {
	useMutation,
	useQueryClient,
	useSuspenseInfiniteQuery,
	useSuspenseQuery,
	type InfiniteData,
} from '@tanstack/react-query';
import { useRevalidator } from 'react-router';
import { queryClient } from '../App';
import {fetchTag, fetchTagsPage,
	createTag,
	deleteTag,
	updateTag,
} from '../services/tag-service';
import { useStore } from '../stores/index';
import type { PaginatedTagResponse, SortBy } from '../types';
import {
	type CreateUserTag,
	type UpdateUserTagPayload,
	type UserTag,
} from '../types/index';
import { tagQueryKeys } from '../utils/queryKeys';

export const tagsQueryOptions = (
	search: string = '',
	sortby: SortBy = 'updated_at',
) => ({
	queryKey: tagQueryKeys.list(search, sortby),
	queryFn: fetchTagsPage,
	initialPageParam: 1,
	getNextPageParam: (lastPage: PaginatedTagResponse) => lastPage.nextPage,
});

export const tagQueryOptions = (tagId: string) => ({
	queryKey: tagQueryKeys.detail(tagId),
	queryFn: fetchTag,
});

export const useFetchTag = (tagId: string) => {
	const { data } = useSuspenseQuery(tagQueryOptions(tagId));
	return { data };
};

export const useFetchTags = (
	search: string = '',
	sortBy: SortBy = 'updated_at',
) => {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSuspenseInfiniteQuery(tagsQueryOptions(search, sortBy));
	return { data, fetchNextPage, hasNextPage, isFetchingNextPage };
};

export const prefetchTags = (
	search: string = '',
	sortBy: SortBy = 'updated_at',
) => {
	queryClient.prefetchInfiniteQuery(tagsQueryOptions(search, sortBy));
};

export const EnsureTags = (
	search: string = '',
	sortBy: SortBy = 'updated_at',
) => {
	return queryClient.ensureInfiniteQueryData<
		PaginatedTagResponse,
		Error,
		InfiniteData<PaginatedTagResponse>,
		ReturnType<typeof tagQueryKeys.list>,
		number
	>(tagsQueryOptions(search, sortBy));
};

type UpdateTagInput = {
	id: string;
	payload: UpdateUserTagPayload;
};

export function useCreateTag() {
	const revalidator = useRevalidator();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (newTag: CreateUserTag) => createTag(newTag),
		onMutate: async (newTag) => {
			try {
				await queryClient.cancelQueries({ queryKey: tagQueryKeys.all });
			} catch (e) {
				console.error('Failed to cancel queries:', e);
			}
			const previous = snapshotTags(queryClient);
			const tempId = `temp-${Date.now()}`;
			const now = new Date().toISOString();
			const optimistic: UserTag = {
				id: tempId,
				user: 'me',
				tag: {
					id: tempId,
					name: newTag.tag_data?.name ?? '',
					created_at: now,
					updated_at: now,
				},
				is_trashed: false,
				created_at: now,
				updated_at: now,
			};

			updateTagsCaches(queryClient, (tags, pageIndex) =>
				pageIndex && pageIndex > 0 ? tags : [optimistic, ...tags],
			);

			return { previous, tempId };
		},
		onSuccess: (created, _input, context) => {
			updateTagsCaches(queryClient, (tags) =>
				tags.map((item) => (item.id === context?.tempId ? created : item)),
			);

			const store = useStore.getState();
			store.setSelectedTagId(created.id);
			revalidator.revalidate();
		},
		onError: (error, _input, context) => {
			console.error('Failed to create tag:', error);
			restoreTags(queryClient, context?.previous);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: tagQueryKeys.all });
		},
	});
}

export function useUpdateTag() {
	const revalidator = useRevalidator();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }: UpdateTagInput) => updateTag(id, payload),
		onMutate: async ({ id, payload }: UpdateTagInput) => {
			await queryClient.cancelQueries({ queryKey: tagQueryKeys.all });
			const previous = snapshotTags(queryClient);
			const now = new Date().toISOString();
			updateTagsCaches(queryClient, (tags) =>
				tags.map((tag) =>
					tag.id === id
						? {
								...tag,
								...payload,
								updated_at: now,
								tag: {
									...tag.tag,
									updated_at: now,
									...(payload.name !== undefined
										? { name: payload.name ?? '' }
										: {}),
								},
							}
						: tag,
				),
			);

			return { previous };
		},
		onSuccess: (updated: UserTag) => {
			updateTagsCaches(queryClient, (tags) =>
				tags.map((tag) => (tag.id === updated.id ? updated : tag)),
			);

			revalidator.revalidate();
		},
		onError: (error, _input, context) => {
			console.error('Failed to update tag:', error);
			restoreTags(queryClient, context?.previous);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: tagQueryKeys.all });
		},
	});
}

export function useDeleteTag() {
	const revalidator = useRevalidator();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (tagId: string) => deleteTag(tagId),
		onMutate: async (tagId) => {
			await queryClient.cancelQueries({ queryKey: tagQueryKeys.all });
			const previous = snapshotTags(queryClient);
			updateTagsCaches(queryClient, (tags) =>
				tags.filter((tag) => tag.id !== tagId),
			);

			return { previous };
		},
		onSuccess: () => {
			revalidator.revalidate();
		},
		onError: (error, _input, context) => {
			console.error('Failed to delete tag:', error);
			restoreTags(queryClient, context?.previous);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: tagQueryKeys.all });
		},
	});
}

/*
 Snapshot the current state of the cache so we can rollback if the mutation fails.
 */
function snapshotTags(queryClient: ReturnType<typeof useQueryClient>) {
	return queryClient.getQueriesData<UserTag[]>({
		queryKey: tagQueryKeys.all,
	});
}

/**
  Restore the cache to the previous state using the snapshot.
 */
function restoreTags(
	queryClient: ReturnType<typeof useQueryClient>,
	previous: [readonly unknown[], UserTag[] | undefined][] | undefined,
) {
	if (previous) {
		previous.forEach(([queryKey, data]) => {
			queryClient.setQueryData(queryKey, data);
		});
	}
}

/**
 Update the cache across all queries (search, pagination, etc.)
 */
function updateTagsCaches(
	queryClient: ReturnType<typeof useQueryClient>,
	updater: (oldTags: UserTag[], pageIndex?: number) => UserTag[],
) {
	// Get all matching queries and update them individually
	const queries = queryClient.getQueriesData<
		| UserTag[]
		| { results: UserTag[] }
		| { pages: { results: UserTag[] }[]; pageParams: unknown[] }
	>({ queryKey: tagQueryKeys.all });

	for (const [queryKey, oldData] of queries) {
		if (!oldData) continue;

		let newData:
			| UserTag[]
			| { results: UserTag[] }
			| { pages: { results: UserTag[] }[]; pageParams: unknown[] }
			| undefined;

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
}
