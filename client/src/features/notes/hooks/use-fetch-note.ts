import { useSuspenseQuery } from "@tanstack/react-query";
import { noteQueryOptions } from "../utils/query-options";

export const useFetchNote = (noteId: string) => {
    const { data } = useSuspenseQuery(noteQueryOptions(noteId));
    return { data };
};
