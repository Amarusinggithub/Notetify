import type { SortBy } from "@/shared/types";

export const spaceQueryKeys = {
    all: ["spaces"] as const,
    detail: (spaceId: string) =>
        [...spaceQueryKeys.all, "detail", spaceId] as const,
    list: (search: string, sortBy: SortBy) =>
        [...spaceQueryKeys.all, "list", search, sortBy] as const,
};

export const fileQueryKeys = {
    all: ["files"] as const,
    detail: (fileId: string) =>
        [...fileQueryKeys.all, "detail", fileId] as const,
    list: (search: string, sortBy: SortBy) =>
        [...fileQueryKeys.all, "list", search, sortBy] as const,
};

export const taskQueryKeys = {
    all: ["tasks"] as const,
    detail: (taskId: string) =>
        [...taskQueryKeys.all, "detail", taskId] as const,
    list: (search: string, sortBy: SortBy) =>
        [...taskQueryKeys.all, "list", search, sortBy] as const,
};

export const eventQueryKeys = {
    all: ["events"] as const,
    detail: (eventId: string) =>
        [...eventQueryKeys.all, "detail", eventId] as const,
    list: (search: string, sortBy: SortBy) =>
        [...eventQueryKeys.all, "list", search, sortBy] as const,
};
