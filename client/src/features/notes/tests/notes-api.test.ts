import { describe, expect, it, vi } from 'vitest';
import api from '@/shared/lib/api';
import * as notes from '@/features/notes/services/note-service';

vi.mock('@/shared/lib/api', () => {
	return {
		default: {
			get: vi.fn(async () => ({
				data: { results: [], nextPage: null, hasNextPage: false },
			})),
			put: vi.fn(async (_url: string, body: any) => ({ data: body })),
			delete: vi.fn(async () => ({})),
		},
	};
});

describe('notes api', () => {
	it('fetchNotesPage calls GET with page and query params', async () => {
		await notes.fetchNotesPage({
			pageParam: 2,
			queryKey: ['notes', 'list', 'abc', 'updated_at'],
		} as any);
		expect((api as any).get).toHaveBeenCalledWith(
			'notes?page=2&sort_by=updated_at&sort_direction=desc&search=abc'
		);
	});

	it('updateNote calls PUT with the flag payload', async () => {
		const data = await notes.updateNote('id-1', { is_pinned_in_home: true });
		expect((api as any).put).toHaveBeenCalledWith('notes/id-1', {
			is_pinned_in_home: true,
		});
		expect(data).toEqual({ is_pinned_in_home: true });
	});

	it('deleteNote calls DELETE endpoint', async () => {
		await notes.deleteNote('note-1');
		expect((api as any).delete).toHaveBeenCalledWith('notes/note-1');
	});
});
