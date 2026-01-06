import {
	ClientSideSuspense,
	LiveblocksProvider,
	RoomProvider,
} from '@liveblocks/react/suspense';
import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams, useRouteLoaderData } from 'react-router';
import { EditorNotesSidebar } from '../../components/app-notes-sidebar';
import { Editor, EditorLoadingSkeleton } from '../../components/editor';
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
	const initialData = useRouteLoaderData('notes');
	const selectedId = useStore((s) => s.selectedNoteId);
	const setSelected = useStore((s) => s.setSelectedNoteId);
	const { mutate: createNote, isPending: isCreating } = useCreateNote();
	const currentUser = useStore((s) => s.sharedData?.auth.user);
	const isCreatingRef = useRef(false);

	useEffect(() => {
		const routeNoteId = noteId ?? null;

		// URL has a noteId - sync store to match
		if (routeNoteId) {
			if (routeNoteId !== selectedId) {
				setSelected(routeNoteId);
			}
			return;
		}

		// No noteId in URL - try to navigate to selected or first note
		if (selectedId) {
			navigate(`/notes/${selectedId}`, { replace: true });
			return;
		}

		const firstFromInitial = initialData?.results?.[0];
		if (firstFromInitial) {
			setSelected(firstFromInitial.id);
			navigate(`/notes/${firstFromInitial.id}`, { replace: true });
			return;
		}

		// No notes exist - create one (use ref to prevent double creation)
		if (!isCreating && !isCreatingRef.current) {
			isCreatingRef.current = true;
			createNote(
				{
					note_data: {
						title: `Agenda- ${new Date().toLocaleDateString()}`,
						content: '',
						users: [],
					},
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
					onSettled: () => {
						isCreatingRef.current = false;
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
		<NotesSidebarProvider defaultOpen={true}>
			<EditorNotesSidebar />

			<NotesSidebarInset>
				<LiveblocksProvider
					resolveUsers={resolveUsers}
					authEndpoint={authEndpoint}
				>
					<RoomProvider id={`note-${noteId ?? selectedId ?? 'new'}`}>
						<ClientSideSuspense fallback={<EditorLoadingSkeleton />}>
							<Editor />
						</ClientSideSuspense>
					</RoomProvider>
				</LiveblocksProvider>
			</NotesSidebarInset>
		</NotesSidebarProvider>
	);
}
