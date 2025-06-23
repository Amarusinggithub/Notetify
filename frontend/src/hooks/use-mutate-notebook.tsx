import { type CreateNote, type UserNotebook } from '../types/index.ts';
import axiosInstance from '../lib/axios.ts';












export const getNotebooks = async () => {
	try {
		const response = await axiosInstance.get(
			'notebooks/?is_pinned=True&is_favorited=True',
		);
		console.log(response.data);
		return response.data;
	} catch (e) {
		console.error(e);
	}
};
export const createNotebook = async (notebook: CreateNote) => {
	try {
		const response = await axiosInstance.post('notebooks/', {
			note_data: notebook.note_data,
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
				users: userNotebook.notebook.users,
			},
			user: userNotebook.user,
			is_pinned: userNotebook.is_pinned,
			is_trashed: userNotebook.is_trashed,
			is_archived: userNotebook.is_archived,
			is_favorited: userNotebook.is_favorited,
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
