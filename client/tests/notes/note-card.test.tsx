import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import NoteCard from '../../src/components/note-card';
import { useNotesStore } from '../../src/stores/slices/notes-slice';

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
	afterEach(() => {
		useNotesStore.setState({ selectedNoteId: null });
	});

	it('sets selected note id when clicked', () => {
		const { container } = render(<NoteCard userNote={userNote as any} />);
		const card =
			container.querySelector('[data-slot="card"]') ||
			screen.getByText('Hello').closest('div');
		// before
		expect(useNotesStore.getState().selectedNoteId).toBeNull();
		fireEvent.click(card!);
		expect(useNotesStore.getState().selectedNoteId).toBe('usernote-1');
	});

	it('shows favorite indicator when note is favorited', () => {
		render(<NoteCard userNote={{ ...userNote, is_favorite: true } as any} />);
		expect(screen.getByTestId('favorite-indicator')).toBeInTheDocument();
	});
});
