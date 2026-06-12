import { queryClient } from '@/app/providers/query-provider';
import { collabSessionQueryOptions } from '../utils/query-options';

export const prefetchCollabSession = (noteId: string) => {
	void queryClient.prefetchQuery(collabSessionQueryOptions(noteId));
};
