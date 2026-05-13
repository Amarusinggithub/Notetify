import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api";
import { noteQueryKeys } from "@/utils/query-keys";

export function useNoteStream() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const url = `${API_BASE_URL}notes/stream`;
        let es: EventSource;
        let retryTimeout: ReturnType<typeof setTimeout>;

        const connect = () => {
            es = new EventSource(url, { withCredentials: true });

            es.addEventListener("message", (e) => {
                try {
                    const { type } = JSON.parse(e.data) as { type: string };
                    if (type === "note.updated") {
                        queryClient.invalidateQueries({ queryKey: noteQueryKeys.all });
                    }
                } catch {
                    // malformed message — ignore
                }
            });

            es.addEventListener("error", () => {
                es.close();
                retryTimeout = setTimeout(connect, 3000);
            });
        };

        connect();

        return () => {
            clearTimeout(retryTimeout);
            es.close();
        };
    }, [queryClient]);
}
