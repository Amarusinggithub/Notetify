import type { QueryFunctionContext } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import type {
	CreateUserNotebook,
	PaginatedNotebooksResponse,
	UpdateUserNotebookPayload,
	UserNotebook,
} from '../types';
import type { notebookQueryKeys } from '../utils/queryKeys';

export async function fetchNotebook({
	queryKey,
}: QueryFunctionContext<
	ReturnType<typeof notebookQueryKeys.detail>
>): Promise<UserNotebook> {
	const [notebookId] = queryKey;

	const response = await axiosInstance.get<UserNotebook>(`notebooks/${notebookId}`);

	return response.data;
}

export async function fetchNotebooksPage({
	queryKey,
	pageParam = 1,
}: QueryFunctionContext<
	ReturnType<typeof notebookQueryKeys.list>,
	number
>): Promise<PaginatedNotebooksResponse> {
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
		const response = await axiosInstance.get<PaginatedNotebooksResponse>(
			`notebooks?${params.toString()}`,
		);
		return response.data;
	} catch (error) {
		console.error('Failed to fetch notebooks:', error);
		return { results: [], nextPage: null, hasNextPage: false };
	}
}

export async function updateNotebook(
	userNotebookId: string,
	payload: UpdateUserNotebookPayload,
): Promise<UserNotebook> {
	const response = await axiosInstance.put<UserNotebook>(
		`notebooks/${userNotebookId}`,
		payload,
	);
	return response.data;
}

export async function deleteNotebook(userNotebookId: string): Promise<void> {
	await axiosInstance.delete(`notebooks/${userNotebookId}`);
}

export const createNotebook = async (userNotebook: CreateUserNotebook): Promise<UserNotebook> => {
	try {
		// Map legacy CreateUserNote shape to API contract
		const response = await axiosInstance.post('notebooks/', {
			content: userNotebook.notebook_data?.name ?? '',
		});
		return response.data as UserNotebook;
	} catch (e) {
		console.error(e);
		throw e;
	}
};
