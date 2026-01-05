import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from '@tanstack/react-query';
import { useRevalidator } from 'react-router';
import axiosInstance from '../lib/axios.ts';
import {
	createNote,
	deleteNote,
	updateNote,
} from '../services/note-service.ts';
import { useStore } from '../stores/index.ts';
import {
	type CreateUserNote,
	type UpdateUserNotePayload,
	type UserNote,
} from '../types';
import { noteQueryKeys } from '../utils/queryKeys.ts';


type UpdateNoteInput = {
	id: string;
	payload: UpdateUserNotePayload;
};

export function useCreateNote() {
	const revalidator = useRevalidator();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (newNote: CreateUserNote) => createNote(newNote),
		onMutate: async (newNote) => {
			await queryClient.cancelQueries({ queryKey: noteQueryKeys.all });
			const previous = snapshotNotes(queryClient);
			const tempId = `temp-${Date.now()}`;
			const now = new Date().toISOString();
			const optimistic: UserNote = {
				id: tempId,
				user: 'me',
				role: 'OWNER',
				note: {
					id: tempId,
					title: newNote.note_data?.title ?? 'Untitled',
					content: newNote.note_data?.content ?? '',
					users: newNote.note_data?.users ?? [],
					is_shared: false,
					created_at: now,
					updated_at: now,
					schedule_delete_at: undefined,
				},
				is_pinned: newNote.is_pinned,
				is_trashed: newNote.is_trashed,
				is_favorite: newNote.is_favorite,
				tags: newNote.tags,
				created_at: now,
				updated_at: now,
				shared_from: undefined,
				shared_at: undefined,
				removed_at: undefined,
				archived_at: undefined,
				trashed_at: undefined,
				favorite_at: undefined,
				pinned_at: undefined,
			};

			updateNotesCaches(queryClient, (notes, pageIndex) =>
				pageIndex && pageIndex > 0 ? notes : [optimistic, ...notes],
			);


            const store = useStore.getState();
			store.setSelectedNoteId(tempId);

			return { previous, tempId };
		},
		onSuccess: (created, _input, context) => {
			updateNotesCaches(queryClient, (notes) =>
				notes.map((item) => (item.id === context?.tempId ? created : item)),
			);

				const store = useStore.getState();
				store.setSelectedNoteId(created.id);

			revalidator.revalidate();
		},
		onError: (error, _input, context) => {
			console.error('Failed to create note:', error);
			restoreNotes(queryClient, context?.previous);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: noteQueryKeys.all });
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
			updateNotesCaches(queryClient, (notes) =>
				notes.map((note) =>
					note.id === id
						? {
								...note,
								...payload,
								note: {
									...note.note,
									...(payload.title !== undefined
										? { title: payload.title }
										: {}),
									...(payload.content !== undefined
										? { content: payload.content ?? '' }
										: {}),
								},
							}
						: note,
				),
			);

			return { previous };
		},
		onSuccess: (updated: UserNote) => {
			updateNotesCaches(queryClient, (notes) =>
				notes.map((note) => (note.id === updated.id ? updated : note)),
			);

			revalidator.revalidate();
		},
		onError: (error, _input, context) => {
			console.error('Failed to update note:', error);
			restoreNotes(queryClient, context?.previous);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: noteQueryKeys.all });
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
				notes.filter((note) => note.id !== noteId),
			);

			return { previous };
		},
		onSuccess: () => {
			revalidator.revalidate();
		},
		onError: (error, _input, context) => {
			console.error('Failed to delete note:', error);
			restoreNotes(queryClient, context?.previous);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: noteQueryKeys.all });
		},
	});
}

export const useSearchNotes = (query: string, params: string) => {
	const { data = [] } = useSuspenseQuery<UserNote[]>({
		queryKey: [`search`],
		queryFn: async () =>
			await axiosInstance
				.get(`notes/?search=${query}&${params}`)
				.then((res) => res.data.results),
	});
	return data;
};

/*
 Snapshot the current state of the cache so we can rollback if the mutation fails.
 */
function snapshotNotes(queryClient: ReturnType<typeof useQueryClient>) {
	return queryClient.getQueriesData<UserNote[]>({
		queryKey: noteQueryKeys.all,
	});
}

/**
  Restore the cache to the previous state using the snapshot.
 */
function restoreNotes(
	queryClient: ReturnType<typeof useQueryClient>,
	previous: [readonly unknown[], UserNote[] | undefined][] | undefined,
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
	updater: (oldNotes: UserNote[], pageIndex?: number) => UserNote[],
) {
	queryClient.setQueriesData<UserNote[] | { results: UserNote[] }>(
		{ queryKey: noteQueryKeys.all },
		(oldData) => {
			if (!oldData) return [];

			// Handle if your API returns an Array directly
			if (Array.isArray(oldData)) {
				return updater(oldData);
			}

			// Handle if your API returns a paginated object (e.g. { results: [...] })
			if ('results' in oldData && Array.isArray(oldData.results)) {
				return {
					...oldData,
					results: updater(oldData.results),
				};
			}

			return oldData;
		},
	);
}
