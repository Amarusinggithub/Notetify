import { useSuspenseQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/AxiosService';
import { Note } from '../types/index.ts';

const useSearchNotes = (query: string, params: string) => {
	const { data = [] } = useSuspenseQuery<Note[]>({
		queryKey: [`search`],
		queryFn: async () =>
			await axiosInstance
				.get(`notes/?search=${query}&${params}`)
				.then((res) => res.data.results),
	});
	return data;
};

export default useSearchNotes;
