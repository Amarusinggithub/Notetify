import { CreateNote, Note } from 'types/index.ts';
import axiosInstance from './AxiosService.ts';

export const getNotes = async () => {
	try {
		const response = await axiosInstance.get(
			'notes/?is_pinned=True&is_favorited=True',
		);
		console.log(response.data);
		return response.data;
	} catch (e) {
		console.error(e);
	}
};
export const createNote = async (note: CreateNote) => {
	try {
		const response = await axiosInstance.post('notes/', {
			note_data: note.note_data,
			tags: note.tags,
			is_pinned: note.is_pinned,
			is_trashed: note.is_trashed,
			is_archived: note.is_archived,
			is_favorited: note.is_favorited,
		});
		return response.status;
	} catch (e) {
		console.error(e);
	}
};

export const updateNote = async (note: Note) => {
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
			is_archived: note.is_archived,
			is_favorited: note.is_favorited,
		});

		return response.status;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const deleteNote = async (note: Note) => {
	try {
		const response = await axiosInstance.delete(`notes/${note.id}/`);
		return response.status;
	} catch (e) {
		console.error(e);
	}
};
