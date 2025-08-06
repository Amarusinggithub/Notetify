// hooks/useFetchNotes.ts
import { useSuspenseQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axios.ts';
import { type UserNote, noteQueryKeys } from '../types';

type FectchNotesProps = {
	category?: string;
	params?: string;
};

const useFetchNotes = ({
	category: string,
	params: string,
}: FectchNotesProps) => {
	const key = noteQueryKeys.list(category, params);
	const { data = [] } = useSuspenseQuery<UserNote[]>({
		queryKey: key,
		queryFn: async () =>
			await axiosInstance
				.get(`notes/?${params}`)
				.then((res) => res.data.results),
	});

	return data;
};

export default useFetchNotes;
