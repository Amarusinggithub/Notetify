import type { QueryFunctionContext } from '@tanstack/react-query';
import { getCollabSession } from '../services/collab-service';
import { collabQueryKeys } from './query-keys';

export const collabSessionQueryOptions = (noteId: string) => ({
	queryKey: collabQueryKeys.detail(noteId),
	queryFn: ({
		queryKey,
	}: QueryFunctionContext<ReturnType<typeof collabQueryKeys.detail>>) =>
		getCollabSession(queryKey[1]),
	// JWT TTL is 60min; treat the token as fresh just under that so warmed
	// tokens are reused on click instead of re-fetched.
	staleTime: 50 * 60 * 1000,
});
