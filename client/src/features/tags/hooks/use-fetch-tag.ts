import { useSuspenseQuery } from '@tanstack/react-query';
import { tagQueryOptions } from '../utils/query-options';

export const useFetchTag = (tagId: string) => {
	const { data } = useSuspenseQuery(tagQueryOptions(tagId));
	return { data };
};
