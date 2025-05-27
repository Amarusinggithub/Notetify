import 'axios';

declare module 'axios' {
	export interface InternalAxiosRequestConfig {
		_retry?: boolean;
	}
}

export const CSRF_TOKEN_COOKIE_NAME = 'csrftoken';
export const USERDATA_STORAGE_KEY = 'userData';
type roles = 'admin' | 'editor' | 'member';

export type User = {
	id: string;
	username: string;
	email: string;
	avatar?: string;
	role: roles;
	email_verified_at: string | null;
	createdAt: Date;
	updatedAt: Date;
};
export type UserNote = {
	id: number;
	note: {
		id: number;
		title: string;
		content: string;
		users: number[];
	};
	user: number;
	tags: number[];
	is_pinned: boolean;
	is_trashed: boolean;
	is_archived: boolean;
	is_favorited: boolean;
	role: string;
};

export interface UserNoteData extends Omit<UserNote, 'note'> {
	note_data: {
		title: string;
		content: string;
		users: number[];
	};
}

export interface Tag {
	id?: number;
	name: string;
	users?: number[];
}

export interface BreadcrumbItem {
	title: string;
	href: string;
}

export interface NavItem {
	title: string;
	href: string;
	icon?: string;
	isActive?: boolean;
}
