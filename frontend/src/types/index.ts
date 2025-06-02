import { IconProp } from '@fortawesome/fontawesome-svg-core';
import 'axios';

declare module 'axios' {
	export interface InternalAxiosRequestConfig {
		_retry?: boolean;
	}
}

//Constants
export const CSRF_TOKEN_COOKIE_NAME = 'csrftoken';
export const USERDATA_STORAGE_KEY = 'userData';

type roles = 'owner' | 'editor' | 'member';

//Models
export type User = {
	id: string;
	username: string;
	email: string;
	avatar?: string;
	role: roles;
	email_verified_at: string | null;
	created_at: Date;
	updated_at: Date;
};
export type CreateNote = {
	note_data: {
		title: string;
		content: string;
		users: number[];
	};

	tags: number[];
	is_pinned: boolean;
	is_trashed: boolean;
	is_archived: boolean;
	is_favorited: boolean;
	role: string;
};

export interface Note extends Omit<CreateNote, 'note_data'> {
	id: number;
	note: {
		id: number;
		title: string;
		content: string;
		users: number[];
		created_at: Date;
		updated_at: Date;
	};
	user: number;
}

export interface Tag {
	id?: number;
	name: string;
	users?: number[];
	created_at?: Date;
	updated_at?: Date;
}

export interface BreadcrumbItem {
	title: string;
	href: string;
}

export interface SideMenuItem {
	name: string;
	href: string;
	icon?: IconProp;
	isActive?: boolean;
	params: string;
}

export const noteQueryKeys = {
	all: ['notes'] as const,
	lists: () => [...noteQueryKeys.all, 'lists'] as const,
	list: (category: string, params: string) =>
		[...noteQueryKeys.lists(), category, params] as const,
};
