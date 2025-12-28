import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type CreateNote, type UserNote } from '../types';
import { useRevalidator } from 'react-router';
import { useNotesStore } from '../stores/use-notes-store';
import { createNote, deleteNote, updateNote } from '../services/note-services';

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

