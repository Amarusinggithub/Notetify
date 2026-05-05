import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUpdateNote } from '../../src/hooks/use-note.ts';
import { noteQueryKeys } from '../../src/utils/queryKeys.ts';

const mockRevalidate = vi.fn();
const updateNoteMock = vi.fn();

vi.mock('../../src/App', () => ({
	queryClient: {
		prefetchInfiniteQuery: vi.fn(),
		ensureInfiniteQueryData: vi.fn(),
	},
}));

vi.mock('react-router', async () => {
	const actual = await vi.importActual('react-router');

	return {
		...actual,
		useRevalidator: () => ({
			revalidate: mockRevalidate,
		}),
	};
});

vi.mock('../../src/services/note-service.ts', () => ({
	createNote: vi.fn(),
	deleteNote: vi.fn(),
	fetchNote: vi.fn(),
	fetchNotesPage: vi.fn(),
	updateNote: (...args: unknown[]) => updateNoteMock(...args),
}));

function createDeferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((resolver) => {
		resolve = resolver;
	});

	return { promise, resolve };
}

describe('useUpdateNote', () => {
	beforeEach(() => {
		mockRevalidate.mockReset();
		updateNoteMock.mockReset();
	});

	it('keeps the note detail cache in sync with optimistic content updates', async () => {
		const noteId = 'note-1';
		const nextContent = '<h1>Updated</h1><p>Body</p>';
		const deferredUpdate = createDeferred<any>();
		const queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		});
		const original = {
			id: noteId,
			user: 'me',
			note: {
				id: 'doc-1',
				content: '<h1>Original</h1><p>Body</p>',
				notebook_id: null,
				is_pinned_to_notebook: false,
				order: 0,
				users: [],
				is_shared: false,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			},
			is_pinned_to_home: false,
			is_trashed: false,
			tags: [],
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);

		queryClient.setQueryData(noteQueryKeys.detail(noteId), original);
		queryClient.setQueryData(noteQueryKeys.list('', 'updated_at'), {
			results: [original],
		});

		updateNoteMock.mockImplementation(() => deferredUpdate.promise);

		const { result } = renderHook(() => useUpdateNote(), { wrapper });

		result.current.mutate({
			id: noteId,
			payload: { content: nextContent },
		});

		await waitFor(() => {
			const cached = queryClient.getQueryData<any>(noteQueryKeys.detail(noteId));
			expect(cached.note.content).toBe(nextContent);
		});

		deferredUpdate.resolve({
			...original,
			note: {
				...original.note,
				content: nextContent,
			},
		});

		await waitFor(() => {
			expect(mockRevalidate).toHaveBeenCalled();
		});
	});
});
