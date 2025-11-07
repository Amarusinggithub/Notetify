import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRevalidator } from 'react-router';
import axiosInstance from '../lib/axios';
import { deleteNote as deleteNoteRequest, updateNote as updateNoteRequest } from '../lib/notes';
import { type CreateNote, type UpdateUserNotePayload, type UserNote } from '../types';
import { useNotesStore } from '../stores/use-notes-store';

const NOTES_QUERY_KEY = ['notes'] as const;

type NotesQuerySnapshot = Array<[unknown, unknown]>;

type UpdateNoteInput = {
	id: string;
	payload: UpdateUserNotePayload;
};

function snapshotNotes(queryClient: ReturnType<typeof useQueryClient>): NotesQuerySnapshot {
	return queryClient.getQueriesData({ queryKey: NOTES_QUERY_KEY });
}

function restoreNotes(
	queryClient: ReturnType<typeof useQueryClient>,
	snapshot?: NotesQuerySnapshot,
) {
	snapshot?.forEach(([key, data]) => {
		queryClient.setQueryData(key, data);
	});
}

function updateNotesCaches(
	queryClient: ReturnType<typeof useQueryClient>,
	mapper: (notes: UserNote[], pageIndex?: number) => UserNote[],
) {
	const queries = queryClient.getQueriesData({ queryKey: NOTES_QUERY_KEY });
	queries.forEach(([key, data]: [unknown, any]) => {
		if (!data) return;
		if (Array.isArray(data.pages)) {
			const pages = data.pages.map((page: any, index: number) => {
				if (!page?.results) return page;
				return {
					...page,
					results: mapper(page.results as UserNote[], index),
				};
			});
			queryClient.setQueryData(key, { ...data, pages });
		} else if (Array.isArray(data.results)) {
			queryClient.setQueryData(key, {
				...data,
				results: mapper(data.results as UserNote[]),
			});
		}
	});
}

export function useCreateNote() {
	const revalidator = useRevalidator();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (newNote: CreateNote) => createNote(newNote),
		onMutate: async (newNote) => {
			await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY });
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
				is_favorited: newNote.is_favorited,
				tags: newNote.tags,
				created_at: now,
				updated_at: now,
				shared_from: undefined,
				shared_at: undefined,
				removed_at: undefined,
				archived_at: undefined,
				trashed_at: undefined,
				favorited_at: undefined,
				pinned_at: undefined,
			};

			updateNotesCaches(queryClient, (notes, pageIndex) =>
				pageIndex && pageIndex > 0 ? notes : [optimistic, ...notes],
			);

			try {
				const store = useNotesStore.getState();
				store.upsertNote(optimistic);
				store.setSelectedNote(tempId);
			} catch {}

			return { previous, tempId };
		},
		onSuccess: (created, _input, context) => {
			updateNotesCaches(queryClient, (notes) =>
				notes.map((item) => (item.id === context?.tempId ? created : item)),
			);
			try {
				const store = useNotesStore.getState();
				store.upsertNote(created);
				store.setSelectedNote(created.id);
			} catch {}
			revalidator.revalidate();
		},
		onError: (error, _input, context) => {
			console.error('Failed to create note:', error);
			restoreNotes(queryClient, context?.previous);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
		},
	});
}

export function useUpdateNote() {
	const revalidator = useRevalidator();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }: UpdateNoteInput) =>
			updateNoteRequest(id, payload),
		onMutate: async ({ id, payload }) => {
			await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY });
			const previous = snapshotNotes(queryClient);
			updateNotesCaches(queryClient, (notes) =>
				notes.map((note) =>
					note.id === id
						? {
								...note,
								...payload,
								note: {
									...note.note,
									...(payload.title !== undefined ? { title: payload.title } : {}),
									...(payload.content !== undefined
										? { content: payload.content ?? '' }
										: {}),
								},
						  }
						: note,
				),
			);
			try {
				const store = useNotesStore.getState();
				const existing = store.notes.find((note) => note.id === id);
				if (existing) {
					store.upsertNote({
						...existing,
						...payload,
						note: {
							...existing.note,
							...(payload.title !== undefined ? { title: payload.title } : {}),
							...(payload.content !== undefined
								? { content: payload.content ?? '' }
								: {}),
						},
					});
				}
			} catch {}
			return { previous };
		},
		onSuccess: (updated) => {
			updateNotesCaches(queryClient, (notes) =>
				notes.map((note) => (note.id === updated.id ? updated : note)),
			);
			try {
				useNotesStore.getState().upsertNote(updated);
			} catch {}
			revalidator.revalidate();
		},
		onError: (error, _input, context) => {
			console.error('Failed to update note:', error);
			restoreNotes(queryClient, context?.previous);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
		},
	});
}

export function useDeleteNote() {
	const revalidator = useRevalidator();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (noteId: string) => deleteNoteRequest(noteId),
		onMutate: async (noteId) => {
			await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY });
			const previous = snapshotNotes(queryClient);
			updateNotesCaches(queryClient, (notes) =>
				notes.filter((note) => note.id !== noteId),
			);
			try {
				useNotesStore.getState().removeNote(noteId);
			} catch {}
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
			queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
		},
	});
}

const createNote = async (note: CreateNote): Promise<UserNote> => {
	try {
		const response = await axiosInstance.post('/notes', {
			title: note.note_data?.title ?? '',
			content: note.note_data?.content ?? '',
			is_favorited: note.is_favorited,
			is_pinned: note.is_pinned,
			is_trashed: note.is_trashed,
		});
		return response.data as UserNote;
	} catch (error) {
		console.error('Failed to create note:', error);
		throw error;
	}
};
