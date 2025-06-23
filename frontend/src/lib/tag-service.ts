import { CreateTag, UserTag } from '../types';
import axiosInstance from './axios-service.ts';

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
