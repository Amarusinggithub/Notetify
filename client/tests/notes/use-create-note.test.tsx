import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCreateNote } from '../../src/hooks/use-note.ts';
import { useStore } from '../../src/stores/index.ts';
import { noteQueryKeys } from '../../src/utils/queryKeys.ts';

const mockNavigate = vi.fn();
const mockRevalidate = vi.fn();
const createNoteMock = vi.fn();

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
		useNavigate: () => mockNavigate,
		useRevalidator: () => ({
			revalidate: mockRevalidate,
		}),
	};
});

vi.mock('../../src/services/note-service.ts', () => ({
	createNote: (...args: unknown[]) => createNoteMock(...args),
	deleteNote: vi.fn(),
	fetchNote: vi.fn(),
	fetchNotesPage: vi.fn(),
	updateNote: vi.fn(),
}));

function createDeferred() {
	let resolve!: () => void;
	const promise = new Promise<void>((resolver) => {
		resolve = resolver;
	});

	return { promise, resolve };
}

describe('useCreateNote', () => {
	beforeEach(() => {
		localStorage.clear();
		useStore.setState({ selectedNoteId: 'note-old' });
		mockNavigate.mockReset();
		mockRevalidate.mockReset();
		createNoteMock.mockReset();
	});

	it('caches the created note before selection changes and waits for navigation to finish', async () => {
		const deferredNavigate = createDeferred();
		const created = {
			id: 'note-new',
			user: 'me',
			note: {
				id: 'note-doc-new',
				content: '',
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
		const queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		});
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);

		mockNavigate.mockImplementation(() => deferredNavigate.promise);
		mockRevalidate.mockResolvedValue(undefined);
		createNoteMock.mockResolvedValue(created);

		const { result } = renderHook(() => useCreateNote(), { wrapper });

		result.current.mutate({
			note_data: {
				content: '',
			},
			tags: [],
			is_trashed: false,
		});

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith('/notes/note-new');
		});

		expect(queryClient.getQueryData(noteQueryKeys.detail(created.id))).toEqual(created);
		expect(useStore.getState().selectedNoteId).toBe('note-old');

		deferredNavigate.resolve();

		await waitFor(() => {
			expect(useStore.getState().selectedNoteId).toBe(created.id);
		});
		expect(mockRevalidate).toHaveBeenCalled();
	});
});
