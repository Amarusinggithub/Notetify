import {
    EditorNotesSidebar,
    NotesSidebarError,
    NotesSidebarSkeleton,
} from "@/features/notes/components/notes-sidebar";
import { EditorError } from "@/features/editor/components/editor-error.tsx";
import { EditorLoadingSkeleton } from "@/features/editor/components/editor-loading-skeleton.tsx";
import {
    NotesSidebarInset,
    NotesSidebarProvider,
} from "@/shared/components/ui/notes-sidebar";
import { noteQueryOptions } from "@/features/notes/utils/query-options";
import { useCreateNote } from "@/features/notes/hooks/use-create-note.ts";
import { useStore } from "@/app/store/index.ts";
import { useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useEffect, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useNavigate, useParams, useRouteLoaderData } from "react-router";
import { noteQueryKeys } from "../utils/query-keys";
const Editor = lazy(() =>
    import("@/features/editor/components/editor.tsx").then((m) => ({
        default: m.Editor,
    })),
);

export default function Notes() {
    const { noteId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const initialData = useRouteLoaderData("notes");
    const selectedId = useStore((s) => s.selectedNoteId);
    const setSelected = useStore((s) => s.setSelectedNoteId);
    const { mutate: createNote, isPending: isCreating } = useCreateNote();
    const isCreatingRef = useRef(false);

    // Cache-prime individual note from the route loader's list data
    useEffect(() => {
        const firstNote = initialData?.pages?.[0]?.results?.[0];
        if (firstNote) {
            queryClient.setQueryData(
                noteQueryKeys.detail(firstNote.id),
                firstNote,
            );
        }
    }, [initialData, queryClient]);

    useEffect(() => {
        // The URL is the single source of truth for which note is open. The store
        // only ever mirrors it (one-way), so selection can never be written ahead
        // of the route and then reverted — which would flash the previous note.
        if (noteId) {
            queryClient.prefetchQuery(noteQueryOptions(noteId));
            if (noteId !== selectedId) {
                setSelected(noteId);
            }
            return;
        }

        // No note in the URL — put one there. The store follows on the next run
        // once the route updates.
        if (selectedId) {
            navigate(`/notes/${selectedId}`, { replace: true });
            return;
        }

        const firstFromInitial = initialData?.pages?.[0]?.results?.[0];
        if (firstFromInitial) {
            navigate(`/notes/${firstFromInitial.id}`, { replace: true });
            return;
        }

        // No notes exist - create one (ref guards against double creation).
        if (!isCreating && !isCreatingRef.current) {
            isCreatingRef.current = true;
            createNote(
                {},
                {
                    onSettled: () => {
                        isCreatingRef.current = false;
                    },
                },
            );
        }
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
                    {" "}
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
