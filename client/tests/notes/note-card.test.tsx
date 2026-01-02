import { fireEvent, render, screen } from '@testing-library/react';
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

const userNote = {
	id: 'usernote-1',
	user: 'user-1',
	is_pinned: false,
	is_favorite: false,
	is_trashed: false,
	note: {
		id: 'note-1',
		title: 'Hello',
		content: '<p>world</p>',
		users: [],
		is_shared: false,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
	tags: [],
	is_pinned_at: null,
	is_trashed_at: null,
	favorite_at: null,
	created_at: new Date().toISOString(),
	updated_at: new Date().toISOString(),
};

describe('NoteCard', () => {
	it('navigates to note when clicked', () => {
		mockNavigate.mockReset();
		const { container } = render(
			<MemoryRouter>
				<NoteCard userNote={userNote as any} />
			</MemoryRouter>,
		);
		const card =
			container.querySelector('[data-slot="card"]') ||
			screen.getByText('Hello').closest('div');
		fireEvent.click(card!);
		expect(mockNavigate).toHaveBeenCalledWith('/notes/usernote-1');
	});

	it('shows favorite indicator when note is favorited', () => {
		render(
			<MemoryRouter>
				<NoteCard userNote={{ ...userNote, is_favorite: true } as any} />
			</MemoryRouter>,
		);
		expect(screen.getByTestId('favorite-indicator')).toBeInTheDocument();
	});
});
