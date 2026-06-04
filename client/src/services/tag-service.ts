import type { QueryFunctionContext } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
	CreateUserTag,
	PaginatedTagResponse,
	UpdateUserTagPayload,
	UserTag,
} from '@/types';
import type { tagQueryKeys } from '@/utils/query-keys';

export async function fetchTag({
	queryKey,
}: QueryFunctionContext<
	ReturnType<typeof tagQueryKeys.detail>
>): Promise<UserTag> {
	const [, , tagId] = queryKey;

	const response = await api.get<UserTag>(`tags/${tagId}`);

	return response.data;
}

export async function fetchTagsPage({
	queryKey,
	pageParam = 1,
}: QueryFunctionContext<
	ReturnType<typeof tagQueryKeys.list>,
	number
>): Promise<PaginatedTagResponse> {
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

	const response = await api.get<PaginatedTagResponse>(
		`tags?${params.toString()}`
	);
	return response.data;
}

export async function updateTag(
	userTagId: string,
	payload: UpdateUserTagPayload
): Promise<UserTag> {
	const response = await api.put<UserTag>(`tags/${userTagId}`, payload);
	return response.data;
}

export async function deleteTag(userTagId: string): Promise<void> {
	await api.delete(`tags/${userTagId}`);
}

export const createTag = async (tag: CreateUserTag): Promise<UserTag> => {
	try {
		const response = await api.post('tags/', {
			name: tag.tag_data?.name ?? '',
		});
		return response.data as UserTag;
	} catch (e) {
		console.error(e);
		throw e;
	}
};
