import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/shared/lib/api';
import { noteQueryKeys } from '../utils/query-keys';

const useNoteStream = () => {
	const queryClient = useQueryClient();

	useEffect(() => {
		const url = `${API_BASE_URL}notes/stream`;
		let es: EventSource;
		let retryTimeout: ReturnType<typeof setTimeout>;

		const refreshAllNotes = () => {
			queryClient.invalidateQueries({
				queryKey: noteQueryKeys.all,
				predicate: (query) => query.queryKey[1] === 'list',
			});
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
	}, [queryClient]);
};

export default useNoteStream;
