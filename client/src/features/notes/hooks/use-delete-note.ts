import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRevalidator } from "react-router";
import { deleteNote } from "@/features/notes/services/note-service.ts";
import {
    restoreNotes,
    snapshotNotes,
    updateNotesCaches,
} from "../utils/helpers";
import { noteQueryKeys } from "../utils/query-keys";

export const useDeleteNote = () => {
    const revalidator = useRevalidator();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (noteId: string) => deleteNote(noteId),
        onMutate: async (noteId) => {
            await queryClient.cancelQueries({ queryKey: noteQueryKeys.all });
            const previous = snapshotNotes(queryClient);
            updateNotesCaches(queryClient, (notes) =>
                notes.filter((note) => note.id !== noteId),
            );

            return { previous };
        },
        onSuccess: async () => {
            await revalidator.revalidate();
        },
        onError: (error, _input, context) => {
            console.error("Failed to delete note:", error);
            restoreNotes(queryClient, context?.previous);
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: noteQueryKeys.all,
            });
        },
    });
};
