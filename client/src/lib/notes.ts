import axiosInstance from './axios';
import type { PaginatedNotesResponse } from './loaders';
import type { QueryFunctionContext } from '@tanstack/react-query';

export async function fetchNotesPage({
  pageParam = 1,
  queryKey,
}: QueryFunctionContext<[string, string, string]> | { pageParam?: number; queryKey?: any[] }): Promise<PaginatedNotesResponse> {
  const [, search = '', sortBy = 'updated_at'] = (queryKey as any[]) || ['notes', '', 'updated_at'];
  const response = await axiosInstance.get(`/notes/?page=${pageParam}&search=${encodeURIComponent(search)}&sort_by=${encodeURIComponent(sortBy)}`);
  return response.data;
}

export async function updateNote(userNoteId: string, payload: { title?: string; content?: string; is_favorited?: boolean; is_pinned?: boolean; is_trashed?: boolean; }) {
  const response = await axiosInstance.put(`/notes/${userNoteId}`, payload);
  return response.data;
}

