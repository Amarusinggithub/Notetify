import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import NoteCard from '../../src/components/note-card';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
	const actual = await vi.importActual('react-router');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

vi.mock('@lottiefiles/react-lottie-player', () => ({
	Player: ({ children }: any) => children || null,
	Controls: () => null,
}));

const queryClient = new QueryClient({
	defaultOptions: {
		queries: { retry: false },
	},
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={queryClient}>
		<MemoryRouter>{children}</MemoryRouter>
	</QueryClientProvider>
);

const userNote = {
	id: 'usernote-1',
	user: 'user-1',
	is_pinned: false,
	is_trashed: false,
	note: {
		id: 'note-1',
		content: 'Hello',
		users: [],
		is_shared: false,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
	tags: [],
	is_pinned_at: null,
	is_trashed_at: null,
	created_at: new Date().toISOString(),
	updated_at: new Date().toISOString(),
};

describe('NoteCard', () => {
	it('navigates to note when clicked', async () => {
		mockNavigate.mockReset();
		// Mock ensureQueryData to resolve immediately
		vi.spyOn(queryClient, 'ensureQueryData').mockResolvedValue(userNote);

		const { container } = render(<NoteCard userNote={userNote as any} />, {
			wrapper,
		});
		const card =
			container.querySelector('[data-slot="card"]') ||
			screen.getByText('Hello').closest('h1');
		fireEvent.click(card!);

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith('/notes/usernote-1');
		});
	});

	it('shows pin note indicator when note is pinned ', () => {
		render(<NoteCard userNote={userNote as any} />, { wrapper });
		expect(screen.getByTestId('footer')).toBeInTheDocument();
	});
});
