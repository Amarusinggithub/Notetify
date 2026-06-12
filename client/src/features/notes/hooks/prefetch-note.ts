import { queryClient } from '@/app/providers/query-provider';
import { noteQueryOptions } from '../utils/query-options';

export const prefetchNote = async (noteId: string) => {
	await queryClient.prefetchQuery(noteQueryOptions(noteId));
};
