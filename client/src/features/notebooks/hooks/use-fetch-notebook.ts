import { useSuspenseQuery } from '@tanstack/react-query';
import { notebookQueryOptions } from '../utils/query-options';

export const useFetchNotebook = (notebookId: string) => {
	const { data } = useSuspenseQuery(notebookQueryOptions(notebookId));
	return { data };
};
