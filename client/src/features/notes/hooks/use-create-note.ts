import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRevalidator } from "react-router";
import { createNote } from "@/features/notes/services/note-service.ts";
import { useStore } from "@/app/store/index.ts";
import type { CreateNote } from "@/shared/types";
import { type UserNote } from "@/shared/types/index.ts";
import {
    restoreNotes,
    snapshotNotes,
    updateNotesCaches,
} from "../utils/helpers";
import { noteQueryKeys } from "../utils/query-keys";

export const useCreateNote = () => {
    const revalidator = useRevalidator();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    return useMutation({
        mutationFn: (newNote: CreateNote) => createNote(newNote),
        onMutate: async (newNote) => {
            try {
                await queryClient.cancelQueries({
                    queryKey: noteQueryKeys.all,
                });
            } catch (e) {
                console.error("Failed to cancel queries:", e);
            }
            const previous = snapshotNotes(queryClient);
            const tempId = `temp-${Date.now()}`;
            const now = new Date().toISOString();
            const optimistic: UserNote = {
                id: tempId,
                user_id: "me",
                notebook_id: newNote.notebook_id ?? null,
                is_pinned_in_notebook: false,
                is_pinned_in_home: false,
                is_pinned_in_space: false,
                is_owner: true,
                is_shared: false,
                note_id: "temp-note-id",
                pinned_in_notebook_at: null,
                pinned_in_space_at: null,
                pinned_in_home_at: null,
                trashed_at: null,
                order: 0,
                note: {
                    id: tempId,
                    content: null,
                    is_shared: false,
                    created_at: now,
                    updated_at: now,
                    deleted_at: null,
                    created_by_user_id: "me",
                },
                is_trashed: false,
                created_at: now,
                updated_at: now,
            };

            updateNotesCaches(queryClient, (notes, pageIndex) =>
                pageIndex && pageIndex > 0 ? notes : [optimistic, ...notes],
            );

            return { previous, tempId };
        },
        onSuccess: async (created, _input, context) => {
            updateNotesCaches(queryClient, (notes) =>
                notes.map((item) =>
                    item.id === context?.tempId ? created : item,
                ),
            );

            queryClient.setQueryData(noteQueryKeys.detail(created.id), created);
            await navigate(`/notes/${created.id}`);
            useStore.getState().setSelectedNoteId(created.id);
            await revalidator.revalidate();
        },
        onError: (error, _input, context) => {
            console.error("Failed to create note:", error);
            restoreNotes(queryClient, context?.previous);
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: noteQueryKeys.all,
            });
        },
    });
};
