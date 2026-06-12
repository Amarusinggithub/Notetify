import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRevalidator } from 'react-router';
import { updateTag } from '@/features/tags/services/tag-service';
import type { Tag, UpdateTagPayload } from '@/shared/types';
import {
	restoreTags,
	snapshotTags,
	updateTagsCaches,
} from '../utils/helpers';
import { tagQueryKeys } from '../utils/query-keys';

type UpdateTagInput = {
	id: string;
	payload: UpdateTagPayload;
};

export function useUpdateTag() {
	const revalidator = useRevalidator();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }: UpdateTagInput) => updateTag(id, payload),
		onMutate: async ({ id, payload }: UpdateTagInput) => {
			await queryClient.cancelQueries({ queryKey: tagQueryKeys.all });
			const previous = snapshotTags(queryClient);
			const now = new Date().toISOString();
			updateTagsCaches(queryClient, (tags) =>
				tags.map((tag) =>
					tag.id === id
						? {
								...tag,
								...payload,
								updated_at: now,
							}
						: tag
				)
			);

			return { previous };
		},
		onSuccess: async (updated: Tag) => {
			updateTagsCaches(queryClient, (tags) =>
				tags.map((tag) => (tag.id === updated.id ? updated : tag))
			);

			await revalidator.revalidate();
		},
		onError: (error, _input, context) => {
			console.error('Failed to update tag:', error);
			restoreTags(queryClient, context?.previous);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: tagQueryKeys.all });
		},
	});
}
