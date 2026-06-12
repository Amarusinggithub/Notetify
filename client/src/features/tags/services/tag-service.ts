import type { QueryFunctionContext } from '@tanstack/react-query';
import api from '@/shared/lib/api';
import type {
	CreateTag,
	PaginatedTagsResponse,
	Tag,
	UpdateTagPayload,
} from '@/shared/types';
import type { tagQueryKeys } from '@/features/tags/utils/query-keys';

export async function fetchTag({
	queryKey,
}: QueryFunctionContext<
	ReturnType<typeof tagQueryKeys.detail>
>): Promise<Tag> {
	const [, , tagId] = queryKey;

	const response = await api.get<Tag>(`tags/${tagId}`);

	return response.data;
}

export async function fetchTagsPage({
	queryKey,
	pageParam = 1,
}: QueryFunctionContext<
	ReturnType<typeof tagQueryKeys.list>,
	number
>): Promise<PaginatedTagsResponse> {
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

	const response = await api.get<PaginatedTagsResponse>(
		`tags?${params.toString()}`
	);
	return response.data;
}

export async function updateTag(
	tagId: string,
	payload: UpdateTagPayload
): Promise<Tag> {
	const response = await api.put<Tag>(`tags/${tagId}`, payload);
	return response.data;
}

export async function deleteTag(tagId: string): Promise<void> {
	await api.delete(`tags/${tagId}`);
}

export const createTag = async (tag: CreateTag): Promise<Tag> => {
	try {
		const response = await api.post<Tag>('tags/', {
			name: tag.name,
			color: tag.color,
			order: tag.order,
		});
		return response.data;
	} catch (e) {
		console.error(e);
		throw e;
	}
};
