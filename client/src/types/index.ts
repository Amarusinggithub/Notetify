import 'axios';
import type { LucideIcon } from 'lucide-react';

export const CSRF_TOKEN_COOKIE_NAME = 'XSRF-TOKEN';
export const USERDATA_STORAGE_KEY = 'userData';

export type Role = 'OWNER' | 'EDITOR' | 'MEMBER';
export type OAuthProvider = 'GOOGLE' | 'GITHUB' | 'FACEBOOK';

export type CreateOAuthAccount = {
	OAuthProvider: OAuthProvider;
	access_token?: string;
	refresh_token?: string;
	expires_at?: Date;
};

export interface OAuthAccount {
	id: string;
	user: number;
	OAuthProvider: OAuthProvider;
	access_token?: string;
	refresh_token?: string;
	expires_at?: Date;
	created_at: Date;
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

export type CreateTag = {
	tag_data: {
		name: string;
		users?: string[];
	};
};

export interface UserTag extends Omit<CreateTag, 'tag_data'> {
	id: string;
	tag: Tag;
	user: string;
	created_at: Date;
}

export interface Tag {
	id: string;
	name: string;
	users?: number[];
	created_at: Date;
	updated_at: Date;
	schedule_delete_at?: Date;
	removed_at?: Date;
}

export type CreateNote = {
	note_data: {
		title: string;
		content: string;
		users: string[];
	};
	tags: string[];
	is_pinned: boolean;
	is_trashed: boolean;
	is_favorite: boolean;
};

export interface UserNote extends Omit<CreateNote, 'note_data'> {
	id: string;
	note: Note;
	user: string;
	role: Role;
	shared_from?: string;
	shared_at?: string;
	removed_at?: string;
	archived_at?: string;
	trashed_at?: string;
	favorite_at?: string;
	pinned_at?: string;
	created_at: string;
	updated_at: string;
	is_pinned: boolean;
	is_trashed: boolean;
	is_favorite: boolean;
}

export type UpdateUserNotePayload = Partial<{
	title: string;
	content: string | null;
	is_favorite: boolean;
	is_pinned: boolean;
	is_trashed: boolean;
	tags: string[];
}>;

export interface Note {
	id: string;
	title: string;
	content: string;
	users: string[];
	is_shared: boolean;
	created_at: string;
	updated_at: string;
	schedule_delete_at?: string;
}

export type CreateNoteBook = {
	note_book_data: { name: string; users?: number[] };
};

export interface UserNotebook {
	id: string;
	notebook: Notebook;
	notes?: string[];
	user: string;
	role: Role;

	removed_at?: Date;
	archived_at?: Date;
	trashed_at?: Date;
	favorite_at?: Date;
	created_at: Date;
	updated_at: Date;
	is_pinned: boolean;
	is_trashed: boolean;
	is_favorite: boolean;
}

export interface Notebook {
	id: string;
	name: string;
	created_at: Date;
	updated_at: Date;
	schedule_delete_at?: Date;
}
export interface NoteBookNote {
	id: string;
	note: UserNote;
	note_book: Notebook;
	created_at: Date;
	added_at: Date;
	removed_at?: Date;
}

export interface UserNoteBook {
	id: string;
	role: Role;
	user: string;
	note_book: Notebook;
	is_pinned: boolean;
	is_favorite: boolean;
	is_trashed: boolean;
	archived_at?: Date;
	trashed_at?: Date;
	favorite_at?: Date;
	removed_at?: Date;
	created_at: Date;
}

export interface NoteTag {
	id: string;
	note: Note;
	tag: Tag;
	removed_at?: Date;
	created_at: Date;
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

export const noteQueryKeys = {
	all: ['notes'] as const,
	lists: () => [...noteQueryKeys.all, 'lists'] as const,
	list: (category: string, params: string) =>
		[...noteQueryKeys.lists(), category, params] as const,
};

export type NoteAction =
	| { type: 'SET_TITLE'; payload: string }
	| { type: 'SET_CONTENT'; payload: string }
	| { type: 'TOGGLE_ARCHIVED' }
	| { type: 'TOGGLE_TRASHED' }
	| { type: 'TOGGLE_FAVORITE' }
	| { type: 'TOGGLE_PINNED' }
	| { type: 'RESET' };

export type NotebookAction =
	| { type: 'SET_TITLE'; payload: string }
	| { type: 'TOGGLE_ARCHIVED' }
	| { type: 'TOGGLE_TRASHED' }
	| { type: 'TOGGLE_FAVORITE' }
	| { type: 'TOGGLE_PINNED' }
	| { type: 'RESET' };
