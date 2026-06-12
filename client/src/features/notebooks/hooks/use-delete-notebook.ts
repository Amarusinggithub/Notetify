import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRevalidator } from 'react-router';
import { deleteNotebook } from '@/features/notebooks/services/notebook-service.ts';
import {
	restoreNotebooks,
	snapshotNotebooks,
	updateNotebooksCaches,
} from '../utils/helpers';
import { notebookQueryKeys } from '../utils/query-keys';

export function useDeleteNotebook() {
	const revalidator = useRevalidator();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (notebookId: string) => deleteNotebook(notebookId),
		onMutate: async (notebookId) => {
			await queryClient.cancelQueries({
				queryKey: notebookQueryKeys.all,
			});
			const previous = snapshotNotebooks(queryClient);
			updateNotebooksCaches(queryClient, (notebooks) =>
				notebooks.filter((notebook) => notebook.id !== notebookId)
			);

			return { previous };
		},
		onSuccess: async () => {
			await revalidator.revalidate();
		},
		onError: (error, _input, context) => {
			console.error('Failed to delete notebook:', error);
			restoreNotebooks(queryClient, context?.previous);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: notebookQueryKeys.all,
			});
		},
	});
}
