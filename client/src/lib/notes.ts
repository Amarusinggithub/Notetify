import type { QueryFunctionContext } from '@tanstack/react-query';
import type { UpdateUserNotePayload, UserNote } from '../types';
import axiosInstance from './axios';
import type { PaginatedNotesResponse } from './loaders';

type NotesQueryContext =
	| QueryFunctionContext<[string, string, string]>
	| { pageParam?: number; queryKey?: any[] };

export async function fetchNotesPage({
	pageParam = 1,
	queryKey,
}: NotesQueryContext): Promise<PaginatedNotesResponse> {
	const [, search = '', sortBy = 'updated_at'] = (queryKey as any[]) || [
		'notes',
		'',
		'updated_at',
	];
	const params = new URLSearchParams({
		page: String(pageParam ?? 1),
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
