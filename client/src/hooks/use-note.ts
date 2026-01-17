import {
	useMutation,
	useQueryClient,
	useSuspenseInfiniteQuery,
	useSuspenseQuery,
	type InfiniteData,
} from '@tanstack/react-query';
import { useNavigate, useRevalidator } from 'react-router';
import { queryClient } from '../App';
import { fetchNote, fetchNotesPage } from '../services/note-service';
import {
	createNote,
	deleteNote,
	updateNote,
} from '../services/note-service.ts';
import { useStore } from '../stores/index.ts';
import type { PaginatedNotesResponse, SortBy } from '../types';
import {
	type CreateUserNote,
	type UpdateUserNotePayload,
	type UserNote,
} from '../types/index.ts';
import { noteQueryKeys } from '../utils/queryKeys.ts';

type NotesType =
	| UserNote[]
	| { results: UserNote[] }
	| { pages: { results: UserNote[] }[]; pageParams: unknown[] }
	| undefined;

export const notesQueryOptions = (
	search: string = '',
	sortby: SortBy = 'updated_at'
) => ({
	queryKey: noteQueryKeys.list(search, sortby),
	queryFn: fetchNotesPage,
	initialPageParam: 1,
	getNextPageParam: (lastPage: PaginatedNotesResponse) => lastPage.nextPage,
});

export const noteQueryOptions = (noteId: string) => ({
	queryKey: noteQueryKeys.detail(noteId),
	queryFn: fetchNote,
});

export const useFetchNote = (noteId: string) => {
	const { data } = useSuspenseQuery(noteQueryOptions(noteId));
	return { data };
};

export const useFetchNotes = (
	search: string = '',
	sortBy: SortBy = 'updated_at'
) => {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSuspenseInfiniteQuery(notesQueryOptions(search, sortBy));
	return { data, fetchNextPage, hasNextPage, isFetchingNextPage };
};

export const prefetchNotes = async (
	search: string = '',
	sortBy: SortBy = 'updated_at'
) => {
	await queryClient.prefetchInfiniteQuery(notesQueryOptions(search, sortBy));
};

export const EnsureNotes = (
	search: string = '',
	sortBy: SortBy = 'updated_at'
) => {
	return queryClient.ensureInfiniteQueryData<
		PaginatedNotesResponse,
		Error,
		InfiniteData<PaginatedNotesResponse>,
		ReturnType<typeof noteQueryKeys.list>,
		number
	>(notesQueryOptions(search, sortBy));
};

type UpdateNoteInput = {
	id: string;
	payload: UpdateUserNotePayload;
};

export function useCreateNote() {
	const revalidator = useRevalidator();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	return useMutation({
		mutationFn: (newNote: CreateUserNote) => createNote(newNote),
		onMutate: async (newNote) => {
			try {
				await queryClient.cancelQueries({ queryKey: noteQueryKeys.all });
			} catch (e) {
				console.error('Failed to cancel queries:', e);
			}
			const previous = snapshotNotes(queryClient);
			const tempId = `temp-${Date.now()}`;
			const now = new Date().toISOString();
			const optimistic: UserNote = {
				id: tempId,
				user: 'me',
				role: 'OWNER',
				note: {
					id: tempId,
					content: newNote.note_data?.content ?? '',
					users: newNote.note_data?.users ?? [],
					is_shared: false,
					created_at: now,
					updated_at: now,
				},
				is_pinned: newNote.is_pinned ?? false,
				is_pinned_to_home: newNote.is_pinned_to_home ?? false,
				is_pinned_to_notebook: newNote.is_pinned_to_notebook ?? false,
				is_pinned_to_space: newNote.is_pinned_to_space ?? false,
				is_trashed: newNote.is_trashed,
				tags: newNote.tags,
				notebook_id: newNote.notebook_id,
				space_id: newNote.space_id,
				created_at: now,
				updated_at: now,
				shared_from: undefined,
				shared_at: undefined,
				trashed_at: undefined,
				pinned_at: undefined,
			};

			updateNotesCaches(queryClient, (notes, pageIndex) =>
				pageIndex && pageIndex > 0 ? notes : [optimistic, ...notes]
			);

			return { previous, tempId };
		},
		onSuccess: async (created, _input, context) => {
			updateNotesCaches(queryClient, (notes) =>
				notes.map((item) => (item.id === context?.tempId ? created : item))
			);

			const store = useStore.getState();
			store.setSelectedNoteId(created.id);
			await navigate(`/notes/${created.id}`);
			await revalidator.revalidate();
		},
		onError: (error, _input, context) => {
			console.error('Failed to create note:', error);
			restoreNotes(queryClient, context?.previous);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: noteQueryKeys.all });
		},
	});
}

export function useUpdateNote() {
	const revalidator = useRevalidator();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }: UpdateNoteInput) => updateNote(id, payload),
		onMutate: async ({ id, payload }: UpdateNoteInput) => {
			await queryClient.cancelQueries({ queryKey: noteQueryKeys.all });
			const previous = snapshotNotes(queryClient);
			const now = new Date().toISOString();
			updateNotesCaches(queryClient, (notes) =>
				notes.map(
					(note): UserNote =>
						note.id === id
							? {
									...note,
									...payload,
									// this ensure required booleans are never undefined
									is_pinned: payload.is_pinned ?? note.is_pinned,
									is_pinned_to_home:
										payload.is_pinned_to_home ?? note.is_pinned_to_home,
									is_pinned_to_notebook:
										payload.is_pinned_to_notebook ?? note.is_pinned_to_notebook,
									is_pinned_to_space:
										payload.is_pinned_to_space ?? note.is_pinned_to_space,
									is_trashed: payload.is_trashed ?? note.is_trashed,
									// Convert null to undefined for optional string fields
									notebook_id:
										payload.notebook_id === null
											? undefined
											: (payload.notebook_id ?? note.notebook_id),
									space_id:
										payload.space_id === null
											? undefined
											: (payload.space_id ?? note.space_id),
									updated_at: now,
									note: {
										...note.note,
										updated_at: now,
										...(payload.content !== undefined
											? { content: payload.content ?? '' }
											: {}),
									},
								}
							: note
				)
			);

			return { previous };
		},
		onSuccess: async (updated: UserNote) => {
			updateNotesCaches(queryClient, (notes) =>
				notes.map((note) => (note.id === updated.id ? updated : note))
			);

			await revalidator.revalidate();
		},
		onError: (error, _input, context) => {
			console.error('Failed to update note:', error);
			restoreNotes(queryClient, context?.previous);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: noteQueryKeys.all });
		},
	});
}

export function useDeleteNote() {
	const revalidator = useRevalidator();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (noteId: string) => deleteNote(noteId),
		onMutate: async (noteId) => {
			await queryClient.cancelQueries({ queryKey: noteQueryKeys.all });
			const previous = snapshotNotes(queryClient);
			updateNotesCaches(queryClient, (notes) =>
				notes.filter((note) => note.id !== noteId)
			);

			return { previous };
		},
		onSuccess: async () => {
			await revalidator.revalidate();
		},
		onError: (error, _input, context) => {
			console.error('Failed to delete note:', error);
			restoreNotes(queryClient, context?.previous);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: noteQueryKeys.all });
		},
	});
}

/*
 Snapshot the current state of the cache so we can rollback if the mutation fails.
 */
function snapshotNotes(queryClient: ReturnType<typeof useQueryClient>) {
	return queryClient.getQueriesData<NotesType>({
		queryKey: noteQueryKeys.all,
	});
}

/**
  Restore the cache to the previous state using the snapshot.
 */
function restoreNotes(
	queryClient: ReturnType<typeof useQueryClient>,
	previous: [readonly unknown[], NotesType][] | undefined
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
function updateNotesCaches(
	queryClient: ReturnType<typeof useQueryClient>,
	updater: (oldNotes: UserNote[], pageIndex?: number) => UserNote[]
) {
	// Get all matching queries and update them individually
	const queries = queryClient.getQueriesData<NotesType>({
		queryKey: noteQueryKeys.all,
	});

	for (const [queryKey, oldData] of queries) {
		if (!oldData) continue;

		let newData: NotesType;

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
