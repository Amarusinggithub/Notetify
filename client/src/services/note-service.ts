import type { QueryFunctionContext } from '@tanstack/react-query';
import type { PaginatedNotesResponse } from '../components/app-notes-sidebar';
import axiosInstance from '../lib/axios';
import type { CreateUserNote, UpdateUserNotePayload, UserNote } from '../types';

export type SortNoteBy =
	| 'updated_at'
	| 'created_at'
	| 'title'
	| 'is_favorite'
	| 'is_pinned';



type NotesQueryKey = readonly ['notes', string, SortNoteBy];

export async function fetchNotesPage({
	pageParam = 1,
	queryKey,
}: QueryFunctionContext<
	NotesQueryKey,
	number
>): Promise<PaginatedNotesResponse> {
	const [_key, search, sortBy] = queryKey;
	const params = new URLSearchParams({
		page: String(pageParam),
		sort_by: sortBy,
		sort_direction: 'desc',
	});

	if (!params.get('page')) {
		params.set('page', '1');
	}

	if (search) {
		params.set('search', search);
	}

	try {
		const response = await axiosInstance.get<PaginatedNotesResponse>(
			`/notes?${params.toString()}`,
		);
		return response.data;
	} catch (error) {
		console.error('Failed to fetch notes:', error);
		return { results: [], nextPage: null, hasNextPage: false };
	}
}

export async function updateNote(
	userNoteId: string,
	payload: UpdateUserNotePayload,
): Promise<UserNote> {
	const response = await axiosInstance.put<UserNote>(
		`/notes/${userNoteId}`,
		payload,
	);
	return response.data;
}

export async function deleteNote(userNoteId: string): Promise<void> {
	await axiosInstance.delete(`/notes/${userNoteId}`);
}

export const createNote = async (note: CreateUserNote): Promise<UserNote> => {
	try {
		// Map legacy CreateUserNote shape to API contract
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
