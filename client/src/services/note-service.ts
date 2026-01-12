import type { QueryFunctionContext } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import type {
	CreateUserNote,
	PaginatedNotesResponse,
	UpdateUserNotePayload,
	UserNote,
} from '../types';
import type { noteQueryKeys } from '../utils/queryKeys';

export async function fetchNote({
	queryKey,
}: QueryFunctionContext<
	ReturnType<typeof noteQueryKeys.detail>
>): Promise<UserNote> {
	const [noteId] = queryKey;

	const response = await axiosInstance.get<UserNote>(`notes/${noteId}`);

	return response.data;
}

export async function fetchNotesPage({
	queryKey,
	pageParam = 1,
}: QueryFunctionContext<
	ReturnType<typeof noteQueryKeys.list>,
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
			`notes?${params.toString()}`
		);
		return response.data;
	} catch (error) {
		console.error('Failed to fetch notes:', error);
		return { results: [], nextPage: null, hasNextPage: false };
	}
}

export async function updateNote(
	userNoteId: string,
	payload: UpdateUserNotePayload
): Promise<UserNote> {
	const response = await axiosInstance.put<UserNote>(
		`notes/${userNoteId}`,
		payload
	);
	return response.data;
}

export async function deleteNote(userNoteId: string): Promise<void> {
	await axiosInstance.delete(`notes/${userNoteId}`);
}

export const createNote = async (note: CreateUserNote): Promise<UserNote> => {
	try {
		const payload: Record<string, any> = {
			content: note.note_data?.content ?? '',
			is_trashed: note.is_trashed,
		};

		if (note.notebook_id) payload.notebook_id = note.notebook_id;
		if (note.space_id) payload.space_id = note.space_id;
		if (note.is_pinned_to_home !== undefined)
			payload.is_pinned_to_home = note.is_pinned_to_home;
		if (note.is_pinned_to_notebook !== undefined)
			payload.is_pinned_to_notebook = note.is_pinned_to_notebook;
		if (note.is_pinned_to_space !== undefined)
			payload.is_pinned_to_space = note.is_pinned_to_space;

		if (note.tags && note.tags.length > 0) {
			payload.tags = note.tags.map((t) => t.name);
		}

		const response = await axiosInstance.post('notes/', payload);
		return response.data as UserNote;
	} catch (e) {
		console.error(e);
		throw e;
	}
};
