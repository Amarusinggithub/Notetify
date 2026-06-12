import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRevalidator } from 'react-router';
import { updateNotebook } from '@/features/notebooks/services/notebook-service.ts';
import {
	type UpdateUserNotebookPayload,
	type UserNotebook,
} from '@/shared/types/index.ts';
import {
	restoreNotebooks,
	snapshotNotebooks,
	updateNotebooksCaches,
} from '../utils/helpers';
import { notebookQueryKeys } from '../utils/query-keys';

type UpdateNotebookInput = {
	id: string;
	payload: UpdateUserNotebookPayload;
};

export function useUpdateNotebook() {
	const revalidator = useRevalidator();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }: UpdateNotebookInput) =>
			updateNotebook(id, payload),
		onMutate: async ({ id, payload }: UpdateNotebookInput) => {
			await queryClient.cancelQueries({
				queryKey: notebookQueryKeys.all,
			});
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
								},
							}
						: notebook
				)
			);

			return { previous };
		},
		onSuccess: async (updated: UserNotebook) => {
			updateNotebooksCaches(queryClient, (notebooks) =>
				notebooks.map((notebook) =>
					notebook.id === updated.id ? updated : notebook
				)
			);

			await revalidator.revalidate();
		},
		onError: (error, _input, context) => {
			console.error('Failed to update notebook:', error);
			restoreNotebooks(queryClient, context?.previous);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: notebookQueryKeys.all,
			});
		},
	});
}
