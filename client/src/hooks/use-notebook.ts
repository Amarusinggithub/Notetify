import { useMutation, useQueryClient, useSuspenseInfiniteQuery, useSuspenseQuery, type InfiniteData } from '@tanstack/react-query';
import { useRevalidator, useNavigate } from 'react-router';
import {
    createNotebook,
    deleteNotebook,
    fetchNotebook,
    fetchNotebooksPage,
    updateNotebook,
} from '../services/notebook-service.ts';
import { useStore } from '../stores/index.ts';
import {
    type CreateUserNotebook,
    type PaginatedNotebooksResponse,
    type SortBy,
    type UpdateUserNotebookPayload,
    type UserNotebook,
} from '../types/index.ts';
import { notebookQueryKeys } from '../utils/queryKeys.ts';
import { queryClient } from 'App.tsx';


export const notebooksQueryOptions = (
	search: string = '',
	sortby: SortBy = 'updated_at',
) => ({
	queryKey: notebookQueryKeys.list(search, sortby),
	queryFn: fetchNotebooksPage,
	initialPageParam: 1,
	getNextPageParam: (lastPage: PaginatedNotebooksResponse) => lastPage.nextPage,
});

export const notebookQueryOptions = (noteId: string) => ({
	queryKey: notebookQueryKeys.detail(noteId),
	queryFn: fetchNotebook,
});

export const useFetchNotebook = (noteId: string) => {
	const { data } = useSuspenseQuery(notebookQueryOptions(noteId));
	return { data };
};

export const useFetchNotebooks = (
	search: string = '',
	sortBy: SortBy = 'updated_at',
) => {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSuspenseInfiniteQuery(notebooksQueryOptions(search, sortBy));
	return { data, fetchNextPage, hasNextPage, isFetchingNextPage };
};

export const prefetchNotes = (
	search: string = '',
	sortBy: SortBy = 'updated_at',
) => {
	queryClient.prefetchInfiniteQuery(notebooksQueryOptions(search, sortBy));
};

export const EnsureNotes = (
	search: string = '',
	sortBy: SortBy = 'updated_at',
) => {
	return queryClient.ensureInfiniteQueryData<
		PaginatedNotebooksResponse,
		Error,
		InfiniteData<PaginatedNotebooksResponse>,
		ReturnType<typeof notebookQueryKeys.list>,
		number
	>(notebooksQueryOptions(search, sortBy));
};


type UpdateNotebookInput = {
    id: string;
    payload: UpdateUserNotebookPayload;
};

export function useCreateNotebook() {
    const revalidator = useRevalidator();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    return useMutation({
        mutationFn: (newNotebook: CreateUserNotebook) => createNotebook(newNotebook),
        onMutate: async (newNotebook) => {
            try {
                    await queryClient.cancelQueries({ queryKey: notebookQueryKeys.all });
                } catch (e) {
                    console.error("Failed to cancel queries:",e );
                }
            const previous = snapshotNotebooks(queryClient);
            const tempId = `temp-${Date.now()}`;
            const now = new Date().toISOString();
            const optimistic: UserNotebook = {
                id: tempId,
                user: 'me',
                role: 'OWNER',
                notebook: {
                    id: tempId,
                    name: newNotebook.notebook_data?.name ?? '',
                    users: newNotebook.notebook_data?.users ?? [],
                    is_shared: false,
                    created_at: now,
                    updated_at: now,
                },
                is_pinned: newNotebook.is_pinned,
                is_trashed: newNotebook.is_trashed,
                created_at: now,
                updated_at: now,
                shared_from: undefined,
                shared_at: undefined,
                trashed_at: undefined,
            };

            updateNotebooksCaches(queryClient, (notebooks, pageIndex) =>
                pageIndex && pageIndex > 0 ? notebooks : [optimistic, ...notebooks],
            );



            return { previous, tempId };
        },
        onSuccess: (created, _input, context) => {
            updateNotebooksCaches(queryClient, (notebooks) =>
                notebooks.map((item) => (item.id === context?.tempId ? created : item)),
            );

            const store = useStore.getState();
            store.setSelectedNotebookId(created.id);
            navigate(`/notebooks/${created.id}`);
            revalidator.revalidate();
        },
        onError: (error, _input, context) => {
            console.error('Failed to create notebook:', error);
            restoreNotebooks(queryClient, context?.previous);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: notebookQueryKeys.all });
        },
    });
}

export function useUpdateNotebook() {
    const revalidator = useRevalidator();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: UpdateNotebookInput) => updateNotebook(id, payload),
        onMutate: async ({ id, payload }: UpdateNotebookInput) => {
            await queryClient.cancelQueries({ queryKey: notebookQueryKeys.all });
            const previous = snapshotNotebooks(queryClient);
            const now = new Date().toISOString();
            updateNotebooksCaches(queryClient, (notebooks) =>
							notebooks.map((notebook) =>
								notebook.id === id
									? {
											...notebook,
											...payload,
											updated_at: now,
											notebook: {
												...notebook.notebook,
												updated_at: now,

												...(payload.name !== undefined
													? { name: payload.name ?? '' }
													: {}),
											},
										}
									: notebook,
							),
						);

            return { previous };
        },
        onSuccess: (updated: UserNotebook) => {
            updateNotebooksCaches(queryClient, (notebooks) =>
                notebooks.map((notebook) => (notebook.id === updated.id ? updated : notebook)),
            );

            revalidator.revalidate();
        },
        onError: (error, _input, context) => {
            console.error('Failed to update notebook:', error);
            restoreNotebooks(queryClient, context?.previous);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: notebookQueryKeys.all });
        },
    });
}

export function useDeleteNotebook() {
    const revalidator = useRevalidator();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (notebookId: string) => deleteNotebook(notebookId),
        onMutate: async (notebookId) => {
            await queryClient.cancelQueries({ queryKey: notebookQueryKeys.all });
            const previous = snapshotNotebooks(queryClient);
            updateNotebooksCaches(queryClient, (notebooks) =>
                notebooks.filter((notebook) => notebook.id !== notebookId),
            );

            return { previous };
        },
        onSuccess: () => {
            revalidator.revalidate();
        },
        onError: (error, _input, context) => {
            console.error('Failed to delete notebook:', error);
            restoreNotebooks(queryClient, context?.previous);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: notebookQueryKeys.all });
        },
    });
}

/*
 Snapshot the current state of the cache so we can rollback if the mutation fails.
 */
function snapshotNotebooks(queryClient: ReturnType<typeof useQueryClient>) {
    return queryClient.getQueriesData<UserNotebook[]>({
        queryKey: notebookQueryKeys.all,
    });
}

/**
  Restore the cache to the previous state using the snapshot.
 */
function restoreNotebooks(
    queryClient: ReturnType<typeof useQueryClient>,
    previous: [readonly unknown[], UserNotebook[] | undefined][] | undefined,
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
function updateNotebooksCaches(
	queryClient: ReturnType<typeof useQueryClient>,
	updater: (oldNotes: UserNotebook[], pageIndex?: number) => UserNotebook[],
) {
	// Get all matching queries and update them individually
	const queries = queryClient.getQueriesData<
		| UserNotebook[]
		| { results: UserNotebook[] }
		| { pages: { results: UserNotebook[] }[]; pageParams: unknown[] }
	>({ queryKey: notebookQueryKeys.all });

	for (const [queryKey, oldData] of queries) {
		if (!oldData) continue;

		let newData:
			| UserNotebook[]
			| { results: UserNotebook[] }
			| { pages: { results: UserNotebook[] }[]; pageParams: unknown[] }
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
