import { IconProp } from '@fortawesome/fontawesome-svg-core';
import 'axios';
import { BrotliCompress } from 'zlib';

declare module 'axios' {
	export interface InternalAxiosRequestConfig {
		_retry?: boolean;
	}
}

//Constants
export const CSRF_TOKEN_COOKIE_NAME = 'csrftoken';
export const USERDATA_STORAGE_KEY = 'userData';

type role = 'OWNER' | 'EDITOR' | 'MEMBER';
type OAuthProvider = 'FACEBOOK' | 'GOOGLE' | 'GITHUB';

//Models

export type CreateOAuthAccount ={

}

export type OAuthAccount = {};

export type CreateUser = {
	first_name?: string;
	last_name?: string;
	email: string;
	password?: string;
};
export interface User extends Omit<CreateUser, 'password' | 'confirmPassword'> {
	id: number;
	avatar?: string;
	email_verified_at: string | null;
	created_at: Date;
	updated_at: Date;
	is_active: boolean;
};
export type CreateNote = {
	note_data: {
		title: string;
		content: string;
		users: number[];
	};
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
		is_shared: boolean;
	};
	tags: number[];
	user: number;
	is_pinned: boolean;
	is_trashed: boolean;
	is_archived: boolean;
	is_favorited: boolean;
	shared_from: number;
	shared_at?: Date;
	removed_at?: Date;
	role: string;
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
