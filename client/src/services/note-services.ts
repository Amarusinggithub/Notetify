import axiosInstance from '../lib/axios';
import { type CreateNote, type UserNote } from '../types';

export const getNotes = async () => {
	try {
		const response = await axiosInstance.get(
			'notes/?is_pinned=True&is_favorite=True',
		);
		console.log(response.data);
		return response.data;
	} catch (e) {
		console.error(e);
	}
};
export const createNote = async (note: CreateNote): Promise<UserNote> => {
	try {
		// Map legacy CreateNote shape to API contract
		const response = await axiosInstance.post('/notes/', {
			title: note.note_data?.title ?? '',
			content: note.note_data?.content ?? '',
		});
		return response.data as UserNote;
	} catch (e) {
		console.error(e);
		throw e;
	}
};

export const updateNote = async (note: UserNote) => {
	console.log('this');
	try {
		const response = await axiosInstance.put(`notes/${note.id}/`, {
			id: note.id,
			note: note.note.id,

			note_data: {
				title: note.note.title,
				content: note.note.content,
				users: note.note.users,
			},
			user: note.user,
			tags: note.tags,
			is_pinned: note.is_pinned,
			is_trashed: note.is_trashed,
			is_favorite: note.is_favorite,
		});

		return response.status;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const deleteNote = async (note: UserNote) => {
	try {
		const response = await axiosInstance.delete(`notes/${note.id}/`);
		return response.status;
	} catch (e) {
		console.error(e);
	}
};
