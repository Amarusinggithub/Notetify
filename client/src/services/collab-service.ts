import { api } from '@/lib/api';

export async function getCollabSession(noteId: string) {
	const { data } = await api.post(`/collab/token/${noteId}`);
	return data as { token: string; wsUrl: string; docId: string };
}
