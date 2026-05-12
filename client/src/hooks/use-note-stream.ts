import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api";
import { noteQueryKeys } from "@/utils/query-keys";

export function useNoteStream() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const url = `${API_BASE_URL}notes/stream`;
        const es = new EventSource(url, { withCredentials: true });

        es.addEventListener("message", (e) => {
            try {
                const { type, noteId } = JSON.parse(e.data) as {
                    type: string;
                    noteId: string;
                };
                if (type === "note.updated" && noteId) {
                    queryClient.invalidateQueries({
                        queryKey: noteQueryKeys.detail(noteId),
                    });
                    queryClient.invalidateQueries({
                        queryKey: noteQueryKeys.all,
                    });
                }
            } catch {
                // malformed message — ignore
            }
        });

        es.addEventListener("error", () => {
            es.close();
        });

        return () => es.close();
    }, [queryClient]);
}
