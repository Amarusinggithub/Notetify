import {
	ClientSideSuspense,
	LiveblocksProvider,
	RoomProvider,
} from '@liveblocks/react/suspense';
import { useCallback, useEffect } from 'react';
import { useNavigate, useParams, useRouteLoaderData } from 'react-router';
import { EditorNotesSidebar } from '../../components/app-notes-sidebar';
import { Editor } from '../../components/editor';
import {
	NotesSidebarInset,
	NotesSidebarProvider,
} from '../../components/ui/notes-sidebar';
import { useCreateNote } from '../../hooks/use-mutate-note';
import axiosInstance from '../../lib/axios';
import { useStore } from '../../stores/index.ts';

export default function Notes() {
	const { noteId } = useParams();
	const navigate = useNavigate();
	const initialData = useRouteLoaderData('root-notes');
	const selectedId = useStore((s) => s.selectedNoteId);
	const setSelected = useStore((s) => s.setSelectedNote);
	const { mutate: createNote, isPending: isCreating } = useCreateNote();
	const currentUser = useStore((s) => s.sharedData?.auth.user);

	useEffect(() => {
		const routeNoteId = noteId ?? null;

		if (routeNoteId && routeNoteId !== selectedId) {
			setSelected(routeNoteId);
			return;
		}

		if (selectedId && routeNoteId !== selectedId) {
			navigate(`/notes/${selectedId}`, { replace: true });
			return;
		}

		const firstFromInitial = initialData?.results?.[0];
		if (!selectedId && firstFromInitial) {
			setSelected(firstFromInitial.id);
			navigate(`/notes/${firstFromInitial.id}`, { replace: true });
			return;
		}

		if (!selectedId && !isCreating) {
			createNote(
				{
					note_data: { title: 'Untitled', content: '', users: [] },
					tags: [],
					is_favorite: false,
					is_pinned: false,
					is_trashed: false,
				},
				{
					onSuccess: (created) => {
						setSelected(created.id);
						navigate(`/notes/${created.id}`, { replace: true });
					},
				},
			);
		}
	}, [
		noteId,
		selectedId,
		initialData,
		navigate,
		setSelected,
		createNote,
		isCreating,
	]);

	const resolveUsers = useCallback(
		async ({ userIds }: { userIds: string[] }) => {
			if (!currentUser) return undefined;
			return userIds.map((id) => {
				if (String(currentUser.id) !== id) {
					return undefined;
				}
				const name = `${currentUser.first_name ?? ''} ${
					currentUser.last_name ?? ''
				}`.trim();
				return {
					name: name || currentUser.email,
					avatar: currentUser.avatar ?? '',
					email: currentUser.email,
				};
			});
		},
		[currentUser],
	);

	const authEndpoint = useCallback(async (room?: string) => {
		if (!room) {
			throw new Error('Room id is required to authorize collaboration.');
		}
		const response = await axiosInstance.post('/liveblocks/auth', { room });
		return response.data;
	}, []);

	return (
		<LiveblocksProvider resolveUsers={resolveUsers} authEndpoint={authEndpoint}>
			<RoomProvider id={`note-${noteId ?? selectedId ?? 'new'}`}>
				<ClientSideSuspense fallback={<div>Loading...</div>}>
					<NotesSidebarProvider defaultOpen={true}>
						<EditorNotesSidebar />
						<NotesSidebarInset>
							<Editor />
						</NotesSidebarInset>
					</NotesSidebarProvider>
				</ClientSideSuspense>
			</RoomProvider>
		</LiveblocksProvider>
	);
}
