import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRevalidator } from 'react-router';
import { deleteTag } from '@/features/tags/services/tag-service';
import {
	restoreTags,
	snapshotTags,
	updateTagsCaches,
} from '../utils/helpers';
import { tagQueryKeys } from '../utils/query-keys';

export function useDeleteTag() {
	const revalidator = useRevalidator();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (tagId: string) => deleteTag(tagId),
		onMutate: async (tagId) => {
			await queryClient.cancelQueries({ queryKey: tagQueryKeys.all });
			const previous = snapshotTags(queryClient);
			updateTagsCaches(queryClient, (tags) =>
				tags.filter((tag) => tag.id !== tagId)
			);

			return { previous };
		},
		onSuccess: async () => {
			await revalidator.revalidate();
		},
		onError: (error, _input, context) => {
			console.error('Failed to delete tag:', error);
			restoreTags(queryClient, context?.previous);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: tagQueryKeys.all });
		},
	});
}
