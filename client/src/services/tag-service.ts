import type { QueryFunctionContext } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import type {
	CreateUserTag,
	PaginatedTagResponse,
	UpdateUserTagPayload,
	UserTag,
} from '../types';
import type { tagQueryKeys } from '../utils/queryKeys';

export async function fetchTag({
	queryKey,
}: QueryFunctionContext<
	ReturnType<typeof tagQueryKeys.detail>
>): Promise<UserTag> {
	const [tagId] = queryKey;

	const response = await axiosInstance.get<UserTag>(`tags/${tagId}`);

	return response.data;
}

export async function fetchTagsPage({
	queryKey,
	pageParam = 1,
}: QueryFunctionContext<
	ReturnType<typeof tagQueryKeys.list>,
	number
>): Promise<PaginatedTagResponse> {
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
		const response = await axiosInstance.get<PaginatedTagResponse>(
			`tags?${params.toString()}`,
		);
		return response.data;
	} catch (error) {
		console.error('Failed to fetch tags:', error);
		return { results: [], nextPage: null, hasNextPage: false };
	}
}

export async function updateTag(
	userTagId: string,
	payload: UpdateUserTagPayload,
): Promise<UserTag> {
	const response = await axiosInstance.put<UserTag>(
		`tags/${userTagId}`,
		payload,
	);
	return response.data;
}

export async function deleteTag(userTagId: string): Promise<void> {
	await axiosInstance.delete(`tags/${userTagId}`);
}

export const createTag = async (tag: CreateUserTag): Promise<UserTag> => {
	try {
		const response = await axiosInstance.post('tags/', {
			name: tag.tag_data?.name ?? '',
		});
		return response.data as UserTag;
	} catch (e) {
		console.error(e);
		throw e;
	}
};
