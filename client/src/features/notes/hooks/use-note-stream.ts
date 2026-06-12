import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/shared/lib/api';
import { noteQueryKeys } from '../utils/query-keys';
import { useRevalidator } from 'react-router';

const useNoteStream = () => {
	const queryClient = useQueryClient();
	const revalidator = useRevalidator();

	useEffect(() => {
		const url = `${API_BASE_URL}notes/stream`;
		let es: EventSource;
		let retryTimeout: ReturnType<typeof setTimeout>;

		const refreshAllNotes = async () => {
			queryClient.invalidateQueries({
				queryKey: noteQueryKeys.all,
				predicate: (query) => query.queryKey[1] === 'list',
			});
			await revalidator.revalidate();
		};

		const connect = () => {
			es = new EventSource(url, { withCredentials: true });

			es.onmessage = (e) => {
				try {
					const { type } = JSON.parse(e.data) as { type: string };
					if (type === 'note.updated') {
						refreshAllNotes();
					}
				} catch {
					return;
				}
			};

			es.onopen = () => {
				refreshAllNotes();
			};

			es.onerror = () => {
				es.close();
				retryTimeout = setTimeout(connect, 3000);
			};
		};

		connect();

		return () => {
			clearTimeout(retryTimeout);
			es.close();
		};
	}, [queryClient, revalidator]);
};

export default useNoteStream;
