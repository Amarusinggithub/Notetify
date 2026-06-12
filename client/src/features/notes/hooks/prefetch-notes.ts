import { queryClient } from "@/app/providers/query-provider";
import type { SortBy } from "@/shared/types";
import { notesQueryOptions } from "../utils/query-options";

export const prefetchNotes = async (
    search: string = "",
    sortBy: SortBy = "updated_at",
) => {
    await queryClient.prefetchInfiniteQuery(notesQueryOptions(search, sortBy));
};
