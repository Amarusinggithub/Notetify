import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useRevalidator } from 'react-router';
import { createNotebook } from '@/features/notebooks/services/notebook-service.ts';
import { useStore } from '@/app/store/index.ts';
import { type CreateNotebook, type UserNotebook } from '@/shared/types/index.ts';
import {
	restoreNotebooks,
	snapshotNotebooks,
	updateNotebooksCaches,
} from '../utils/helpers';
import { notebookQueryKeys } from '../utils/query-keys';

export function useCreateNotebook() {
	const revalidator = useRevalidator();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	return useMutation({
		mutationFn: (newNotebook: CreateNotebook) => createNotebook(newNotebook),
		onMutate: async (newNotebook) => {
			try {
				await queryClient.cancelQueries({
					queryKey: notebookQueryKeys.all,
				});
			} catch (e) {
				console.error('Failed to cancel queries:', e);
			}
			const previous = snapshotNotebooks(queryClient);
			const tempId = `temp-${Date.now()}`;
			const now = new Date().toISOString();
			const optimistic: UserNotebook = {
				id: tempId,
				user_id: 'me',
				notebook: {
					id: tempId,
					name: newNotebook.name,
					is_shared: false,
					deleted_at: null,
					created_by_user_id: 'me',
					space_id: 'none',
					created_at: now,
					updated_at: now,
				},
				is_trashed: false,
				created_at: now,
				updated_at: now,

				notebook_id: 'tempid',
				is_owner: true,
				is_shared: false,
				is_pinned_in_space: false,
				pinned_in_space_at: null,
				is_pinned_in_home: false,
				pinned_in_home_at: null,
				trashed_at: null,
				is_default: false,
			};

			updateNotebooksCaches(queryClient, (notebooks, pageIndex) =>
				pageIndex && pageIndex > 0 ? notebooks : [optimistic, ...notebooks]
			);

			return { previous, tempId };
		},
		onSuccess: async (created, _input, context) => {
			updateNotebooksCaches(queryClient, (notebooks) =>
				notebooks.map((item) => (item.id === context?.tempId ? created : item))
			);

			const store = useStore.getState();
			store.setSelectedNotebookId(created.id);
			await navigate(`/notebooks/${created.id}`);
			await revalidator.revalidate();
		},
		onError: (error, _input, context) => {
			console.error('Failed to create notebook:', error);
			restoreNotebooks(queryClient, context?.previous);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: notebookQueryKeys.all,
			});
		},
	});
}
