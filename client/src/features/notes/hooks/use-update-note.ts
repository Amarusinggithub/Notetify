import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRevalidator } from "react-router";
import {
    updateNote,
} from "@/features/notes/services/note-service.ts";
import {
    type UpdateUserNotePayload,
    type UserNote,
} from "@/shared/types/index.ts";
import {
    restoreNotes,
    snapshotNotes,
    updateNotesCaches,
} from "../utils/helpers";
import { noteQueryKeys } from "../utils/query-keys";

type UpdateNoteInput = {
    id: string;
    payload: UpdateUserNotePayload;
};

export const useUpdateNote = () => {
    const revalidator = useRevalidator();
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["updateNote"],
        mutationFn: ({ id, payload }: UpdateNoteInput) =>
            updateNote(id, payload),
        onMutate: async ({ id, payload }: UpdateNoteInput) => {
            await queryClient.cancelQueries({ queryKey: noteQueryKeys.all });
            const previous = snapshotNotes(queryClient);
            const now = new Date().toISOString();

            const optimisticUpdater = (note: UserNote): UserNote => ({
                ...note,
                is_pinned_in_home:
                    payload.is_pinned_in_home ?? note.is_pinned_in_home,
                is_pinned_in_space:
                    payload.is_pinned_in_space ?? note.is_pinned_in_space,
                is_pinned_in_notebook:
                    payload.is_pinned_in_notebook ?? note.is_pinned_in_notebook,
                is_trashed: payload.is_trashed ?? note.is_trashed,
                is_owner: note.is_owner,
                is_shared: note.is_shared,
                order: note.order,
                updated_at: now,
            });

            updateNotesCaches(queryClient, (notes) =>
                notes.map((note) =>
                    note.id === id ? optimisticUpdater(note) : note,
                ),
            );

            const prevDetail = queryClient.getQueryData<UserNote>(
                noteQueryKeys.detail(id),
            );
            if (prevDetail) {
                queryClient.setQueryData(
                    noteQueryKeys.detail(id),
                    optimisticUpdater(prevDetail),
                );
            }

            return { previous };
        },
        onSuccess: async (updated: UserNote) => {
            queryClient.setQueryData(noteQueryKeys.detail(updated.id), updated);
            updateNotesCaches(queryClient, (notes) =>
                notes.map((note) => (note.id === updated.id ? updated : note)),
            );

            await revalidator.revalidate();
        },
        onError: (error, _input, context) => {
            console.error("Failed to update note:", error);
            restoreNotes(queryClient, context?.previous);
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: noteQueryKeys.all,
            });
        },
    });
};
