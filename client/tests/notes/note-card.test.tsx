import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import NoteCard from '../../src/components/note-card';
import { useNotesStore } from '../../src/stores/use-notes-store';

const userNote = {
	id: 'usernote-1',
	user: 'user-1',
	is_pinned: false,
	is_favorited: false,
	is_trashed: false,
	note: {
		id: 'note-1',
		title: 'Hello',
		content: '<p>world</p>',
		users: [],
		is_shared: false,
		created_at: new Date(),
		updated_at: new Date(),
	},
	tags: [],
	is_pinned_at: null,
	is_trashed_at: null,
	is_favorite_at: null,
	created_at: new Date(),
	updated_at: new Date(),
};

describe('NoteCard', () => {
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
});
