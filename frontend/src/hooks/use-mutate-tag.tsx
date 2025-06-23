import React, {
	createContext,
	type PropsWithChildren,
	useContext,
	useState,
} from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type CreateTag, type UserTag } from '../types';
import axiosInstance from '../lib/axios.ts';



interface TagContextType {
	selectedTag: UserTag | null;
	wantToDeleteTag: boolean;
	wantToEditTag: boolean;
	setSelectedTag: React.Dispatch<React.SetStateAction<UserTag | null>>;
	setWantToDeleteTag: React.Dispatch<React.SetStateAction<boolean>>;
	setWantToEditTag: React.Dispatch<React.SetStateAction<boolean>>;
	makeTag: (tag: CreateTag) => Promise<void>;
	editTag: (tag: UserTag) => Promise<void>;
	removeTag: (tag: UserTag) => Promise<void>;
}

type TagProviderProps = PropsWithChildren;

const TagContext = createContext<TagContextType | undefined>(undefined);

const TagProvider = ({ children }: TagProviderProps) => {
	const queryClient = useQueryClient();

	const [selectedTag, setSelectedTag] = useState<UserTag | null>(null);
	const [wantToDeleteTag, setWantToDeleteTag] = useState<boolean>(false);
	const [wantToEditTag, setWantToEditTag] = useState<boolean>(false);

	const createTagMutation = useMutation({
		mutationFn: createTag,
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ['tags'] });
		},
	});

	const makeTag = async (tag: CreateTag) => {
		/*if (tagName!.trim().length > 0)
			if (
				data.some(
					(tag: Tag) => tag.name.toLowerCase() === tagName.toLowerCase(),
				)
			) {
				alert('Tag already exists!');
				return;
			}*/

		createTagMutation.mutate(tag);
	};

	const editTagMutation = useMutation({
		mutationFn: updateTag,
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ['tags'] });
		},
	});

	const editTag = async (tag: UserTag) => {
		if (tag.tag.name!.trim().length > 0) editTagMutation.mutate(tag);
	};

	const deleteTagMutation = useMutation({
		mutationFn: deleteTag,
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ['tags'] });
		},
	});

	const removeTag = async (tag: UserTag) => {
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







export const getTags = async () => {
	try {
		const response = await axiosInstance.get('tags/');
		console.log(response.data);
		return response.data;
	} catch (e) {
		console.error(e);
	}
};

export const createTag = async (tag: CreateTag) => {
	try {
		const response = await axiosInstance.post('tags/', {
			tag_data: tag.tag_data,
		});
		console.log(response.data);
		return response.status;
	} catch (e) {
		console.error(e);
	}
};

export const updateTag = async (tag: UserTag) => {
	try {
		const response = await axiosInstance.put(`tags/${tag.id}/`, {
			...tag,
		});

		console.log(response.data);
		return response.status;
	} catch (error) {
		console.error(error);
	}
};

export const deleteTag = async (tag: UserTag) => {
	try {
		const response = await axiosInstance.delete(`tags/${tag.id}/`);
		console.log(response.status);
		return response.status;
	} catch (e) {
		console.error(e);
	}
};
