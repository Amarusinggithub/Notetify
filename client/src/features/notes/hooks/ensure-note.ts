import { queryClient } from "@/app/providers/query-provider";
import { noteQueryOptions } from "../utils/query-options";

export const ensureNote = (noteId: string) => {
    return queryClient.ensureQueryData(noteQueryOptions(noteId));
};
