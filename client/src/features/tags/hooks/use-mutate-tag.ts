import { useStore } from '@/app/store/index';
import type { Tag } from '@/shared/types';
import { useUpdateTag } from './use-update-tag';
import { useDeleteTag } from './use-delete-tag';

/**
 * Facade used by the tag dialogs: bundles the edit/delete mutations with the
 * shared selection + dialog-visibility state from the store.
 */
export function useMutateTag() {
	const updateTag = useUpdateTag();
	const deleteTag = useDeleteTag();
	const selectedTag = useStore((s) => s.selectedTag);
	const setWantToEditTag = useStore((s) => s.setWantToEditTag);
	const setWantToDeleteTag = useStore((s) => s.setWantToDeleteTag);
	const removeTag = (tag: Tag) => deleteTag.mutate(tag.id);

	const editTag = (tag: Tag) =>
		updateTag.mutate({ id: tag.id, payload: { name: tag.name } });

	return {
		selectedTag,
		removeTag,
		editTag,
		setWantToEditTag,
		setWantToDeleteTag,
	};
}
