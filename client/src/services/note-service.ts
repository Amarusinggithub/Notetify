import type { QueryFunctionContext } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
	CreateNote,
	UserNote,
	PaginatedNotesResponse,
	UpdateUserNotePayload,
} from '@/types';
import type { noteQueryKeys } from '@/utils/query-keys';

export async function fetchNote({
	queryKey,
}: QueryFunctionContext<
	ReturnType<typeof noteQueryKeys.detail>
>): Promise<UserNote> {
	const [, , noteId] = queryKey;

	const response = await api.get<UserNote>(`notes/${noteId}`);

	return response.data;
}

export async function fetchNotesPage({
	queryKey,
	pageParam = 1,
}: QueryFunctionContext<
	ReturnType<typeof noteQueryKeys.list>,
	number
>): Promise<PaginatedNotesResponse> {
	const [, , search, sortBy] = queryKey;
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

	const response = await api.get<PaginatedNotesResponse>(
		`notes?${params.toString()}`
	);
	return response.data;
}

export async function updateNote(
	userNoteId: string,
	payload: UpdateUserNotePayload
): Promise<UserNote> {
	const response = await api.put<UserNote>(`notes/${userNoteId}`, payload);
	return response.data;
}

export async function deleteNote(userNoteId: string): Promise<void> {
	await api.delete(`notes/${userNoteId}`);
}

export const createNote = async (note: CreateNote): Promise<UserNote> => {
	const response = await api.post<UserNote>('notes/', {
		notebook_id: note.notebook_id ?? null,
	});
	return response.data;
};
