import { queryClient } from "@/app/providers/query-provider";
import type { SortBy, PaginatedNotesResponse } from "@/shared/types";
import type { InfiniteData } from "@tanstack/react-query";
import { fetchNotesPage, fetchNote } from "../services/note-service";
import { noteQueryKeys } from "./query-keys";

export const notesQueryOptions =  (
    search: string = "",
    sortby: SortBy = "updated_at",
) => ({
    queryKey: noteQueryKeys.list(search, sortby),
    queryFn: fetchNotesPage,
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedNotesResponse) => lastPage.nextPage,
    maxPages: 5,
});

export const noteQueryOptions =  (noteId: string) => ({
    queryKey: noteQueryKeys.detail(noteId),
    queryFn: fetchNote,
    initialData: () => {
        const queries = queryClient.getQueriesData<
            InfiniteData<PaginatedNotesResponse>
        >({ queryKey: ["notes", "list"] });
        for (const [, data] of queries) {
            if (!data?.pages) continue;
            for (const page of data.pages) {
                const found = page.results.find((n) => n.id === noteId);
                if (found) return found;
            }
        }
        return undefined;
    },
    initialDataUpdatedAt: () => {
        const queries = queryClient
            .getQueryCache()
            .findAll({ queryKey: ["notes", "list"] });
        return queries[0]?.state.dataUpdatedAt;
    },
});
