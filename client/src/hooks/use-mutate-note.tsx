import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { type CreateNote, type UserNote } from '../types';
import { useRevalidator } from 'react-router';
import { useNotesStore } from '../stores/use-notes-store';
import { createNote, deleteNote, updateNote } from '../services/note-services';
import axiosInstance from '../lib/axios.ts';


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


