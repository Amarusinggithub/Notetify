import { describe, expect, it, vi } from 'vitest';
import axiosInstance from '../../src/lib/axios';
import * as notes from '../../src/services/note-service';

vi.mock('../../src/lib/axios', () => {
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
			queryKey: ['notes', 'abc', 'updated_at'],
		} as any);
		expect((axiosInstance as any).get).toHaveBeenCalledWith(
			'notes?page=2&sort_by=updated_at&sort_direction=desc&search=abc',
		);
	});

	it('updateNote calls PUT with content', async () => {
		const data = await notes.updateNote('id-1', { content: '<p>x</p>' });
		expect((axiosInstance as any).put).toHaveBeenCalledWith('notes/id-1', {
			content: '<p>x</p>',
		});
		expect(data).toEqual({ content: '<p>x</p>' });
	});

	it('deleteNote calls DELETE endpoint', async () => {
		await notes.deleteNote('note-1');
		expect((axiosInstance as any).delete).toHaveBeenCalledWith('notes/note-1');
	});
});
