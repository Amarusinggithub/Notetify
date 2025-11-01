import {
	ClientSideSuspense,
	LiveblocksProvider,
	RoomProvider,
} from '@liveblocks/react/suspense';
import { useEffect } from 'react';
import { useNavigate, useParams, useRouteLoaderData } from 'react-router';
import { EditorNotesSidebar } from '../../components/app-notes-sidebar';
import { Editor } from '../../components/editor';
import {
	NotesSidebarInset,
	NotesSidebarProvider,
} from '../../components/ui/notes-sidebar';
import { useCreateNote } from '../../hooks/use-mutate-note';
import { useNotesStore } from '../../stores/use-notes-store';
import type { PaginatedNotesResponse } from '../../lib/loaders';

export default function Notes() {
    const { noteId } = useParams();
    const navigate = useNavigate();
    const initialData = useRouteLoaderData('root-notes') as PaginatedNotesResponse | undefined;
    const selectedId = useNotesStore((s) => s.selectedNoteId);
    const setSelected = useNotesStore((s) => s.setSelectedNote);
    const createNoteMutation = useCreateNote();

    // Ensure a note is selected and URL reflects it. If none exists, create one.
    useEffect(() => {
        const numericFromRoute = noteId ? Number(noteId) : undefined;
        if (numericFromRoute && !Number.isNaN(numericFromRoute)) {
            setSelected(numericFromRoute);
            return;
        }

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

        if (!createNoteMutation.isPending) {
            createNoteMutation.mutate(
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
    }, [noteId, selectedId, initialData, navigate]);
	return (
		<LiveblocksProvider
			resolveUsers={async ({ userIds }) => {
				// ["marc@example.com", ...]
				console.log(userIds);
				return undefined;
				// Return a list of users
				// ...
			}}
			publicApiKey={
				'pk_dev_-jCBKl4-AWCtRQRkEgoS3IGyZTb7G1kfkVuX20cPxJrz4RjDA2ttgGR1EuGkX6z1'
			}
		>
			<RoomProvider id={`note-${noteId ?? selectedId ?? 'new'}`}>
				<ClientSideSuspense fallback={<div>Loading…</div>}>
					<NotesSidebarProvider   defaultOpen={true}>
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
