import axiosInstance from '../lib/axios';
import { type CreateNote, type UpdateUserNotePayload, type UserNote } from '../types';

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

export const updateNote = async ({
	id,
	payload,
}: {
	id: string;
	payload: UpdateUserNotePayload;
}) => {
	console.log('update user request triggered');
	try {
		const response = await axiosInstance.put(`notes/${id}/`, payload);

		return response.data as UserNote;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const deleteNote = async (id: string) => {
	try {
		const response = await axiosInstance.delete(`notes/${id}/`);
		return response.status;
	} catch (e) {
		console.error(e);
	}
};
