import type { SortBy } from "@/shared/types";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { notesQueryOptions } from "../utils/query-options";

export const useFetchNotes = (
    search: string = "",
    sortBy: SortBy = "updated_at",
) => {
    const {
        data: notes,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useSuspenseInfiniteQuery({
        ...notesQueryOptions(search, sortBy),
        select: (data) => data.pages.flatMap((page) => page.results),
    });
    return { data: notes, fetchNextPage, hasNextPage, isFetchingNextPage };
};
