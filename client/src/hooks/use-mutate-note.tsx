import { useMutation } from '@tanstack/react-query';
import {type CreateNote, type UserNote } from '../types';
import { useRevalidator } from 'react-router';
import axiosInstance from 'lib/axios';

export function useCreateNote() {
	const revalidator = useRevalidator();
	return useMutation({
		mutationFn: (newNote: CreateNote) => createNote(newNote),
		onSuccess: () => {
			revalidator.revalidate();
		},
		onError: (error) => {
			console.error('Failed to create note:', error);
		},
	});
}

export function useUpdateNote() {
	const revalidator = useRevalidator();
	return useMutation({
		mutationFn: (note: UserNote) => updateNote(note),
		onSuccess: () => {
			revalidator.revalidate();
		},
		onError: (error) => {
			console.error('Failed to update note:', error);
		},
	});
}

export function useDeleteNote() {
	const revalidator = useRevalidator();
	return useMutation({
		mutationFn: (note: UserNote) => deleteNote(note),
		onSuccess: () => {
			revalidator.revalidate();
		},
		onError: (error) => {
			console.error('Failed to delete note:', error);
		},
	});
}

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
export const createNote = async (note: CreateNote) => {
	try {
		const response = await axiosInstance.post('notes/', {
			note_data: note.note_data,
		});
		return response.status;
	} catch (e) {
		console.error(e);
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
