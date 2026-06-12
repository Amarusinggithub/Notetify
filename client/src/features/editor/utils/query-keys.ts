export const collabQueryKeys = {
	all: ['collab-session'] as const,
	detail: (noteId: string) => [...collabQueryKeys.all, noteId] as const,
};
