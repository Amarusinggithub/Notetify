import type { QueryFunctionContext } from '@tanstack/react-query';
import type { CreateNote, UpdateUserNotePayload, UserNote } from '../types';
import axiosInstance from '../lib/axios';
import type { PaginatedNotesResponse } from '../components/app-notes-sidebar';

export type SortBy = 'updated_at' | 'created_at' | 'title' | 'is_favorite'| 'is_pinned';

/*
type NotesQueryContext =
	| QueryFunctionContext<[string, string, string]>
	| { pageParam?: number; queryKey?: any[] };

*/

type NotesQueryKey = readonly ['notes', string, SortBy];

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
	if (search) {
		params.set('search', search);
	}

	const response = await axiosInstance.get<PaginatedNotesResponse>(
		`/notes?${params.toString()}`,
	);
	return response.data;
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
