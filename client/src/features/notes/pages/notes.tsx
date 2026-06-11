import {
	EditorNotesSidebar,
	NotesSidebarError,
	NotesSidebarSkeleton,
} from '@/features/notes/components/notes-sidebar';
import { EditorError } from '@/features/editor/components/editor-error.tsx';
import { EditorLoadingSkeleton } from '@/features/editor/components/editor-loading-skeleton.tsx';
import {
	NotesSidebarInset,
	NotesSidebarProvider,
} from '@/shared/components/ui/notes-sidebar';
import { noteQueryOptions, useCreateNote } from '@/features/notes/hooks/use-note.ts';
import { useStore } from '@/app/store/index.ts';
import { noteQueryKeys } from '@/shared/utils/query-keys';
import { useQueryClient } from '@tanstack/react-query';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useNavigate, useParams, useRouteLoaderData } from 'react-router';
const Editor = lazy(() =>
	import('@/features/editor/components/editor.tsx').then((m) => ({
		default: m.Editor,
	}))
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
		const handleNavigation = async () => {
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
				// Awaiting here ensures RRv7 finishes the transition
				await navigate(`/notes/${selectedId}`, { replace: true });
				return;
			}

			// Navigate to first available note
			const firstFromInitial = initialData?.pages?.[0]?.results?.[0];
			if (firstFromInitial) {
				setSelected(firstFromInitial.id);
				await navigate(`/notes/${firstFromInitial.id}`, {
					replace: true,
				});
				return;
			}

			// No notes exist - create onee (use ref to prevent double creation)
			if (!isCreating && !isCreatingRef.current) {
				isCreatingRef.current = true;
				createNote(
					{},
					{
						onSuccess: async (newNote) => {
							setSelected(newNote.id);
							await navigate(`/notes/${newNote.id}`, {
								replace: true,
							});
						},
						onSettled: () => {
							isCreatingRef.current = false;
						},
					}
				);
			}
		};

		handleNavigation();
	}, [
		queryClient,
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
			<ErrorBoundary fallback={<NotesSidebarError />}>
				<Suspense fallback={<NotesSidebarSkeleton />}>
					{' '}
					<EditorNotesSidebar />
				</Suspense>
			</ErrorBoundary>

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
