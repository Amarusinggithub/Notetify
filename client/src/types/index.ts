import 'axios';
import type { LucideIcon } from 'lucide-react';

export const CSRF_TOKEN_COOKIE_NAME = 'XSRF-TOKEN';
export const USERDATA_STORAGE_KEY = 'userData';

export type Role = 'OWNER' | 'EDITOR' | 'MEMBER';
export type OAuthProvider = 'GOOGLE' | 'GITHUB' | 'FACEBOOK';
export type Theme = 'dark' | 'light' | 'system';
export type Language = 'en' | 'de' | 'es' | 'fr' | 'ja';

export type SortBy =
	| 'updated_at'
	| 'created_at'
	| 'title'
	| 'is_pinned'
	| 'is_trashed';

export type CreateOAuthAccount = {
	OAuthProvider: OAuthProvider;
	access_token?: string;
	refresh_token?: string;
	expires_at?: string;
};

export interface OAuthAccount {
	id: string;
	user: number;
	OAuthProvider: OAuthProvider;
	access_token?: string;
	refresh_token?: string;
	expires_at?: string;
	created_at: string;
}

export type CreateUser = {
	first_name?: string;
	last_name?: string;
	email: string;
	password?: string;
};

export interface User extends Omit<CreateUser, 'password'> {
	id: string;
	remember?: boolean;
	avatar?: string;
	is_active: boolean;
}
export interface SharedData {
	name: string;
	auth: Auth;
	sidebarOpen: boolean;
	[key: string]: unknown;
}

export interface Auth {
	user: User;
}

export type CreateUserTag = {
	tag_data: {
		name: string;
	};
};

export interface UserTag extends Omit<CreateUserTag, 'tag_data'> {
	id: string;
	tag: Tag;
	user: string;
	created_at: string;
	is_trashed: boolean;
	updated_at: string;
}

export interface Tag {
	id: string;
	name: string;
	created_at: string;
	updated_at: string;
	schedule_delete_at?: string;
	removed_at?: string;
}

export type UpdateUserTagPayload = Partial<{
	name: string;
	is_trashed: boolean;
}>;

export interface PaginatedTagResponse {
	results: UserTag[];
	nextPage: number | null;
	hasNextPage: boolean;
}

export interface Note {
	id: string;
	content: string;
	users: string[];
	is_shared: boolean;
	created_at: string;
	updated_at: string;
}

export type CreateUserNote = {
	note_data: {
		content: string;
		users: string[];
	};
	tags: Tag[];
	is_pinned: boolean;
	is_trashed: boolean;
};

export interface NoteTag {
	id: string;
	note: Note;
	tag: Tag;
	created_at: string;
}

export interface UserNote extends Omit<CreateUserNote, 'note_data'> {
	id: string;
	note: Note;
	user: string;
	role: Role;
	shared_from?: string;
	shared_at?: string;
	trashed_at?: string;
	pinned_at?: string;
	created_at: string;
	updated_at: string;
	is_pinned: boolean;
	is_trashed: boolean;
	tags: Tag[];
}

export interface PaginatedNotesResponse {
	results: UserNote[];
	nextPage: number | null;
	hasNextPage: boolean;
}

export type UpdateUserNotePayload = Partial<{
	content: string | null;
	is_pinned: boolean;
	is_trashed: boolean;
	tags: Tag[];
}>;



export interface Notebook {
	id: string;
	name: string;
	users?: number[];
	created_at: string;
	updated_at: string;
	is_shared: boolean;
}

export interface NoteBookNote {
	id: string;
	note: Note;
	note_book: Notebook;

	created_at: string;
	added_at: string;
	removed_at?: string;
}

export type CreateUserNotebook = {
	notebook_data: { name: string; users?: number[] };
	is_pinned: boolean;
	is_trashed: boolean;
};
export interface UserNotebook {
	id: string;
	role: Role;
	user: string;
	notes?: string[];
	notebook: Notebook;
	is_trashed: boolean;
	trashed_at?: string;
	created_at: string;
	updated_at: string;
	is_pinned: boolean;
	pinned_at?: string;
	shared_from?: string;
    shared_at?: string;

}

export type UpdateUserNotebookPayload = Partial<{
	name: string;
	is_trashed: boolean;
}>;

export interface PaginatedNotebooksResponse {
	results: UserNotebook[];
	nextPage: number | null;
	hasNextPage: boolean;
}

export interface BreadcrumbItem {
	title: string;
	href: string;
}

export interface NavGroup {
	title: string;
	items: NavItem[];
}

export interface NavItem {
	title: string;
	href: string;
	icon?: LucideIcon | null;
	isActive?: boolean;
	params?: string;
}
