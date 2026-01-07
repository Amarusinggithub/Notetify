import axiosInstance from '../lib/axios.ts';
import { type CreateNotebook, type UserNotebook } from '../types/index.ts';

export const getNotebooks = async () => {
	try {
		const response = await axiosInstance.get(
			'notebooks/?is_pinned=True&is_favorite=True',
		);
		console.log(response.data);
		return response.data;
	} catch (e) {
		console.error(e);
	}
};
export const createNotebook = async (notebook: CreateNotebook) => {
	try {
		const response = await axiosInstance.post('notebooks/', {
			note_data: notebook.notebook_data,
		});
		return response.status;
	} catch (e) {
		console.error(e);
	}
};

export const updateNotebook = async (userNotebook: UserNotebook) => {
	console.log('this');
	try {
		const response = await axiosInstance.put(`notebooks/${userNotebook.id}/`, {
			id: userNotebook.id,
			notebook: userNotebook.notebook.id,

			notebook_data: {
				name: userNotebook.notebook.name,
			},
			user: userNotebook.user,
			is_pinned: userNotebook.is_pinned,
			is_trashed: userNotebook.is_trashed,
		});

		return response.status;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const deleteNotebook = async (note: UserNotebook) => {
	try {
		const response = await axiosInstance.delete(`notebooks/${note.id}/`);
		return response.status;
	} catch (e) {
		console.error(e);
	}
};
