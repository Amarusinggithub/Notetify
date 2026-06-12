import type { QueryFunctionContext } from '@tanstack/react-query';
import api from '@/shared/lib/api';
import type {
	CreateNotebook,
	PaginatedNotebooksResponse,
	UpdateUserNotebookPayload,
	UserNotebook,
} from '@/shared/types';
import type { notebookQueryKeys } from '@/features/notebooks/utils/query-keys';

export async function fetchNotebook({
	queryKey,
}: QueryFunctionContext<
	ReturnType<typeof notebookQueryKeys.detail>
>): Promise<UserNotebook> {
	const [, , notebookId] = queryKey;

	const response = await api.get<UserNotebook>(`notebooks/${notebookId}`);

	return response.data;
}

export async function fetchNotebooksPage({
	queryKey,
	pageParam = 1,
}: QueryFunctionContext<
	ReturnType<typeof notebookQueryKeys.list>,
	number
>): Promise<PaginatedNotebooksResponse> {
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

	const response = await api.get<PaginatedNotebooksResponse>(
		`notebooks?${params.toString()}`
	);
	return response.data;
}

export async function updateNotebook(
	userNotebookId: string,
	payload: UpdateUserNotebookPayload
): Promise<UserNotebook> {
	const response = await api.put<UserNotebook>(
		`notebooks/${userNotebookId}`,
		payload
	);
	return response.data;
}

export async function deleteNotebook(userNotebookId: string): Promise<void> {
	await api.delete(`notebooks/${userNotebookId}`);
}

export const createNotebook = async (
	userNotebook: CreateNotebook
): Promise<UserNotebook> => {
	try {
		const response = await api.post('notebooks/', {
			name: userNotebook.name,
			space_id: userNotebook.space_id,
		});
		return response.data as UserNotebook;
	} catch (e) {
		console.error(e);
		throw e;
	}
};
