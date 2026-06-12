import { api } from '@/shared/lib/api';

export type CollabSession = { token: string; wsUrl: string; docId: string };

export async function getCollabSession(noteId: string): Promise<CollabSession> {
	const { data } = await api.post<CollabSession>(`/collab/token/${noteId}`);
	return data;
}
