import {type LoaderFunctionArgs } from 'react-router';
import {type UserNote } from '../types';
import axiosInstance from './axios';

export interface PaginatedNotesResponse {
	results: UserNote[];
	nextPage: number | null;
	hasNextPage: boolean;
}

export async function notesLoader({
	request,
}: LoaderFunctionArgs): Promise<PaginatedNotesResponse> {
	const url = new URL(request.url);
	// Default to page 1 if no page param is present
	const page = url.searchParams.get('page') || '1';

	try {
		const response = await axiosInstance.get(
			`/notes/?page=${page}${ ''}`,
		);
		return response.data;
	} catch (error) {
		console.error('Failed to fetch notes:', error);
		return { results: [], nextPage: null, hasNextPage: false };
	}
}
