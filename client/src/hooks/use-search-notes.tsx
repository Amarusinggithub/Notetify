import { useSuspenseQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import { type UserNote } from '../types';

const useSearchNotes = (query: string, params: string) => {
	const { data = [] } = useSuspenseQuery<UserNote[]>({
		queryKey: ['search', query, params],
		queryFn: async () => {
			const searchParams = new URLSearchParams(params);
			if (query) {
				searchParams.set('search', query);
			}
			const response = await axiosInstance.get('/notes', {
				params: Object.fromEntries(searchParams.entries()),
			});
			return response.data.results as UserNote[];
		},
	});
	return data;
};

export default useSearchNotes;
