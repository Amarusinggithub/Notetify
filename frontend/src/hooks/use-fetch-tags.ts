import { useSuspenseQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axios-service';
import { type UserTag } from '../types/index';

const useFetchTags = () => {
	const { data = [] } = useSuspenseQuery<UserTag[]>({
		queryKey: ['tags'],
		queryFn: () => axiosInstance.get('tags/').then((res) => res.data.results),
	});

	return data;
};

export default useFetchTags;
