import React, {
	createContext,
	PropsWithChildren,
	useContext,
	useState,
} from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag } from 'types/index.ts';
import { createTag, deleteTag, updateTag } from '../lib/TagService.ts';

interface TagContextType {
	selectedTag: Tag | null;
	wantToDeleteTag: boolean;
	wantToEditTag: boolean;
	setSelectedTag: React.Dispatch<React.SetStateAction<Tag | null>>;
	setWantToDeleteTag: React.Dispatch<React.SetStateAction<boolean>>;
	setWantToEditTag: React.Dispatch<React.SetStateAction<boolean>>;
	makeTag: (tagName: string) => Promise<void>;
	editTag: (tag: Tag) => Promise<void>;
	removeTag: (tag: Tag) => Promise<void>;
}

type TagProviderProps = PropsWithChildren;

const TagContext = createContext<TagContextType | undefined>(undefined);

const TagProvider = ({ children }: TagProviderProps) => {
	const queryClient = useQueryClient();

	const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
	const [wantToDeleteTag, setWantToDeleteTag] = useState<boolean>(false);
	const [wantToEditTag, setWantToEditTag] = useState<boolean>(false);

	const createTagMutation = useMutation({
		mutationFn: createTag,
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ['tags'] });
		},
	});

	const makeTag = async (tagName: string) => {
		/*if (tagName!.trim().length > 0)
			if (
				data.some(
					(tag: Tag) => tag.name.toLowerCase() === tagName.toLowerCase(),
				)
			) {
				alert('Tag already exists!');
				return;
			}*/

		createTagMutation.mutate(tagName);
	};

	const editTagMutation = useMutation({
		mutationFn: updateTag,
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ['tags'] });
		},
	});

	const editTag = async (tag: Tag) => {
		if (tag.name!.trim().length > 0) editTagMutation.mutate(tag);
	};

	const deleteTagMutation = useMutation({
		mutationFn: deleteTag,
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ['tags'] });
		},
	});

	const removeTag = async (tag: Tag) => {
		deleteTagMutation.mutate(tag);
	};

	return (
		<TagContext.Provider
			value={{
				selectedTag,
				wantToDeleteTag,
				wantToEditTag,
				setSelectedTag,
				setWantToDeleteTag,
				setWantToEditTag,
				makeTag,
				removeTag,
				editTag,
			}}
		>
			{children}
		</TagContext.Provider>
	);
};

const useMutateTag = () => {
	const context = useContext(TagContext);
	if (!context) {
		throw new Error('useMutateTag  must be use within a TagProvider');
	}
	return context;
};

export default useMutateTag;
export { TagContext, TagProvider };
