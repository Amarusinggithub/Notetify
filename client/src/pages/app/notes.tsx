import { EditorNotesSidebar } from '@/components/app/app-notes-sidebar';
import { EditorError } from '@/components/editor/editor-error.tsx';
import { EditorLoadingSkeleton } from '@/components/editor/editor-loading-skeleton.tsx';
import {
	NotesSidebarInset,
	NotesSidebarProvider,
} from '@/components/ui/notes-sidebar';
import { noteQueryOptions, useCreateNote } from '@/hooks/use-note.ts';
import { useStore } from '@/stores/index.ts';
import { noteQueryKeys } from '@/utils/queryKeys.ts';
import { useQueryClient } from '@tanstack/react-query';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useNavigate, useParams, useRouteLoaderData } from 'react-router';
const Editor = lazy(() =>
	import('@/components/editor/editor.tsx').then((m) => ({ default: m.Editor }))
);

export default function Notes() {
	const { noteId } = useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const initialData = useRouteLoaderData('notes');
	const selectedId = useStore((s) => s.selectedNoteId);
	const setSelected = useStore((s) => s.setSelectedNoteId);
	const { mutate: createNote, isPending: isCreating } = useCreateNote();
	const isCreatingRef = useRef(false);

	// Cache-prime individual note from the route loader's list data
	useEffect(() => {
		const firstNote = initialData?.pages?.[0]?.results?.[0];
		if (firstNote) {
			queryClient.setQueryData(noteQueryKeys.detail(firstNote.id), firstNote);
		}
	}, [initialData, queryClient]);



	useEffect(() => {
		const routeNoteId = noteId ?? null;

		// URL has a noteId - prefetch its data and sync store
		if (routeNoteId) {
			queryClient.prefetchQuery(noteQueryOptions(routeNoteId));
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

		const firstFromInitial = initialData?.pages?.[0]?.results?.[0];
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
						content: '',
					},
					tags: [],
					is_trashed: false,
				},
				{
					onSettled: () => {
						isCreatingRef.current = false;
					},
				}
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

	return (
		<NotesSidebarProvider defaultOpen={true}>
			<EditorNotesSidebar />

			<NotesSidebarInset>
				<ErrorBoundary fallback={<EditorError />}>
					<Suspense fallback={<EditorLoadingSkeleton />}>
						<Editor />
					</Suspense>
				</ErrorBoundary>
			</NotesSidebarInset>
		</NotesSidebarProvider>
	);
}
