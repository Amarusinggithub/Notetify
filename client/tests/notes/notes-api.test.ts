import { describe, expect, it, vi } from 'vitest';
import * as notes from '../../src/lib/notes';
import axiosInstance from '../../src/lib/axios';

vi.mock('../../src/lib/axios', () => {
  return {
    default: {
      get: vi.fn(async () => ({ data: { results: [], nextPage: null, hasNextPage: false } })),
      put: vi.fn(async (_url: string, body: any) => ({ data: body })),
    },
  };
});

describe('notes api', () => {
  it('fetchNotesPage calls GET with page and query params', async () => {
    await notes.fetchNotesPage({ pageParam: 2, queryKey: ['notes', 'abc', 'updated_at'] } as any);
    expect((axiosInstance as any).get).toHaveBeenCalledWith('/notes/?page=2&search=abc&sort_by=updated_at');
  });

  it('updateNote calls PUT with content', async () => {
    const data = await notes.updateNote('id-1', { content: '<p>x</p>' });
    expect((axiosInstance as any).put).toHaveBeenCalledWith('/notes/id-1', { content: '<p>x</p>' });
    expect(data).toEqual({ content: '<p>x</p>' });
  });
});

