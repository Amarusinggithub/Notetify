import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type CreateNote, type UserNote } from '../types';
import { useRevalidator } from 'react-router';
import axiosInstance from '../lib/axios';
import { useNotesStore } from '../stores/use-notes-store';

export function useCreateNote() {
	const revalidator = useRevalidator();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (newNote: CreateNote) => createNote(newNote),
		onMutate: async (newNote) => {
			// Cancel incoming refetches to avoid race
			await queryClient.cancelQueries({ queryKey: ['notes'] });
			const tempId = -Date.now();
			const optimistic: any = {
				id: tempId,
				note: {
					id: tempId,
					title: newNote?.note_data?.title ?? 'Untitled',
					content: newNote?.note_data?.content ?? '',
					users: newNote?.note_data?.users ?? [],
					is_shared: false,
					created_at: new Date(),
					updated_at: new Date(),
				},
				user: 0,
				role: 'OWNER',
				created_at: new Date(),
				updated_at: new Date(),
				is_pinned: false,
				is_trashed: false,
				is_favorited: false,
			};

			// Snapshot previous caches to rollback if needed
			const previous = queryClient.getQueriesData({ queryKey: ['notes'] });

			// Push optimistic item to all notes caches (infinite and simple)
			previous.forEach(([key, old]: any) => {
				if (!old) return;
				if (old.pages) {
					const first = old.pages[0];
					const updatedFirst = {
						...first,
						results: [optimistic, ...(first?.results ?? [])],
					};
					queryClient.setQueryData(key, {
						...old,
						pages: [updatedFirst, ...old.pages.slice(1)],
					});
				} else if (old.results) {
					queryClient.setQueryData(key, {
						...old,
						results: [optimistic, ...old.results],
					});
				}
			});

			// Select the new optimistic note right away
			try { useNotesStore.getState().setSelectedNote(tempId); } catch {}
			return { previous, tempId };
		},
		onSuccess: (created) => {
			try { useNotesStore.getState().upsertNote(created as any); } catch {}
			try { useNotesStore.getState().setSelectedNote((created as any).id); } catch {}

			// Replace optimistic item with actual in all caches
			const queries = queryClient.getQueriesData({ queryKey: ['notes'] });
			queries.forEach(([key, old]: any) => {
				if (!old) return;
				const replaceInList = (list: any[]) =>
					list.map((n) => (n.id < 0 ? created : n));
				if (old.pages) {
					const pages = old.pages.map((pg: any, idx: number) =>
						idx === 0 ? { ...pg, results: replaceInList(pg.results ?? []) } : pg,
					);
					queryClient.setQueryData(key, { ...old, pages });
				} else if (old.results) {
					queryClient.setQueryData(key, {
						...old,
						results: replaceInList(old.results),
					});
				}
			});

			// Also revalidate route loader for freshness
			revalidator.revalidate();
		},
		onError: (error) => {
			console.error('Failed to create note:', error);
			// Rollback optimistic changes
			const previous = queryClient.getQueriesData({ queryKey: ['notes'] });
			previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
		},
	});
}

export function useUpdateNote() {
	const revalidator = useRevalidator();
	return useMutation({
		mutationFn: (note: UserNote) => updateNote(note),
		onSuccess: () => {
			revalidator.revalidate();
		},
		onError: (error) => {
			console.error('Failed to update note:', error);
		},
	});
}

export function useDeleteNote() {
	const revalidator = useRevalidator();
	return useMutation({
		mutationFn: (note: UserNote) => deleteNote(note),
		onSuccess: () => {
			revalidator.revalidate();
		},
		onError: (error) => {
			console.error('Failed to delete note:', error);
		},
	});
}

export const getNotes = async () => {
	try {
		const response = await axiosInstance.get(
			'notes/?is_pinned=True&is_favorite=True',
		);
		console.log(response.data);
		return response.data;
	} catch (e) {
		console.error(e);
	}
};
export const createNote = async (note: CreateNote): Promise<UserNote> => {
	try {
		// Map legacy CreateNote shape to API contract
		const response = await axiosInstance.post('/notes/', {
			title: note.note_data?.title ?? '',
			content: note.note_data?.content ?? '',
		});
		return response.data as UserNote;
	} catch (e) {
		console.error(e);
		throw e;
	}
};

export const updateNote = async (note: UserNote) => {
	console.log('this');
	try {
		const response = await axiosInstance.put(`notes/${note.id}/`, {
			id: note.id,
			note: note.note.id,

			note_data: {
				title: note.note.title,
				content: note.note.content,
				users: note.note.users,
			},
			user: note.user,
			tags: note.tags,
			is_pinned: note.is_pinned,
			is_trashed: note.is_trashed,
			is_favorite: note.is_favorite,
		});

		return response.status;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const deleteNote = async (note: UserNote) => {
	try {
		const response = await axiosInstance.delete(`notes/${note.id}/`);
		return response.status;
	} catch (e) {
		console.error(e);
	}
};
