import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRevalidator } from 'react-router';
import { createTag } from '@/features/tags/services/tag-service';
import { useStore } from '@/app/store/index';
import type { CreateTag, Tag } from '@/shared/types';
import {
	restoreTags,
	snapshotTags,
	updateTagsCaches,
} from '../utils/helpers';
import { tagQueryKeys } from '../utils/query-keys';

export function useCreateTag() {
	const revalidator = useRevalidator();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (newTag: CreateTag) => createTag(newTag),
		onMutate: async (newTag) => {
			try {
				await queryClient.cancelQueries({ queryKey: tagQueryKeys.all });
			} catch (e) {
				console.error('Failed to cancel queries:', e);
			}
			const previous = snapshotTags(queryClient);
			const tempId = `temp-${Date.now()}`;
			const now = new Date().toISOString();
			const optimistic: Tag = {
				id: tempId,
				user_id: 'me',
				name: newTag.name,
				color: newTag.color ?? null,
				order: newTag.order ?? null,
				created_at: now,
				updated_at: now,
				deleted_at: null,
			};

			updateTagsCaches(queryClient, (tags, pageIndex) =>
				pageIndex && pageIndex > 0 ? tags : [optimistic, ...tags]
			);

			return { previous, tempId };
		},
		onSuccess: async (created, _input, context) => {
			updateTagsCaches(queryClient, (tags) =>
				tags.map((item) => (item.id === context?.tempId ? created : item))
			);

			const store = useStore.getState();
			store.setSelectedTagId(created.id);
			await revalidator.revalidate();
		},
		onError: (error, _input, context) => {
			console.error('Failed to create tag:', error);
			restoreTags(queryClient, context?.previous);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: tagQueryKeys.all });
		},
	});
}
