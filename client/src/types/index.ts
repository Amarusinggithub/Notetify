import 'axios';
import type { LucideIcon } from 'lucide-react';


// Constants
export const CSRF_TOKEN_COOKIE_NAME = 'XSRF-TOKEN';
export const USERDATA_STORAGE_KEY = 'userData';


// Common Types
export type Role = 'OWNER' | 'EDITOR' | 'MEMBER';
export type Permission = 'view' | 'edit' | 'admin';
export type OAuthProvider = 'GOOGLE' | 'GITHUB' | 'FACEBOOK';
export type Theme = 'dark' | 'light' | 'system';
export type Language = 'en' | 'de' | 'es' | 'fr' | 'ja';
export type SortBy =
	| 'updated_at'
	| 'created_at'
	| 'title'
	| 'is_pinned'
	| 'is_trashed';


// Auth & User Types
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
	emailNotificationEnabled?: boolean;
	pushNotificationEnabled?: boolean;
	marketingNotificationEnabled?: boolean;
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


// Tag Types
export interface Tag {
	id: string;
	name: string;
	created_at: string;
	updated_at: string;
	schedule_delete_at?: string;
	removed_at?: string;
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

export type UpdateUserTagPayload = Partial<{
	name: string;
	is_trashed: boolean;
}>;

export interface PaginatedTagResponse {
	results: UserTag[];
	nextPage: number | null;
	hasNextPage: boolean;
}

// Space Types
export interface Space {
	id: string;
	user_id: string;
	name: string;
	description?: string;
	icon?: string;
	color?: string;
	order: number;
	created_at: string;
	updated_at: string;
	is_shared: boolean;
}

export type CreateSpace = {
	name: string;
	description?: string;
	icon?: string;
	color?: string;
};

export interface UserSpace {
	id: string;
	space_id: string;
	space: Space;
	user: string;
	is_pinned_to_home: boolean;
	pinned_to_home_at?: string;
	is_trashed: boolean;
	trashed_at?: string;
	is_default: boolean;
	created_at: string;
	updated_at: string;
}

export type UpdateUserSpacePayload = Partial<{
	name: string;
	description: string | null;
	icon: string | null;
	color: string | null;
	is_pinned_to_home: boolean;
	is_trashed: boolean;
	is_default: boolean;
}>;

export interface PaginatedSpacesResponse {
	results: UserSpace[];
	nextPage: number | null;
	hasNextPage: boolean;
}


// Notebook Types
export interface Notebook {
	id: string;
	name: string;
	space_id?: string;
	is_pinned_to_space: boolean;
	pinned_to_space_at?: string;
	added_to_space_at?: string;
	order: number;
	users?: string[];
	created_at: string;
	updated_at: string;
	is_shared: boolean;
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


// Note Types
export interface Note {
	id: string;
	content: string;
	notebook_id?: string;
	is_pinned_to_notebook: boolean;
	pinned_to_notebook_at?: string;
	order: number;
	users: string[];
	is_shared: boolean;
	created_at: string;
	updated_at: string;
}

export type CreateUserNote = {
	note_data: {
		content: string;
		notebook_id?: string;
	};
	tags: Tag[];
	is_pinned_to_home?: boolean;
	is_trashed: boolean;
};

export interface NoteTag {
	id: string;
	note: Note;
	tag: Tag;
	created_at: string;
}

export interface NoteBookNote {
	id: string;
	note: Note;
	note_book: Notebook;
	created_at: string;
	added_at: string;
	removed_at?: string;
}

export interface UserNote extends Omit<CreateUserNote, 'note_data'> {
	id: string;
	note: Note;
	user: string;
	is_pinned_to_home: boolean;
	pinned_to_home_at?: string;
	is_trashed: boolean;
	trashed_at?: string;
	created_at: string;
	updated_at: string;
	tags: Tag[];
}

export type UpdateUserNotePayload = Partial<{
	content: string | null;
	is_pinned_to_home: boolean;
	is_trashed: boolean;
	tags: Tag[];
}>;

export interface PaginatedNotesResponse {
	results: UserNote[];
	nextPage: number | null;
	hasNextPage: boolean;
}


// Share Types
export interface SpaceShare {
	id: string;
	space_id: string;
	space: Space;
	shared_by_user_id: string;
	shared_with_user_id: string;
	permission: Permission;
	expires_at?: string;
	accepted: boolean;
	created_at: string;
	updated_at: string;
}

export interface NotebookShare {
	id: string;
	notebook_id: string;
	notebook: Notebook;
	shared_by_user_id: string;
	shared_with_user_id: string;
	permission: Permission;
	expires_at?: string;
	accepted: boolean;
	created_at: string;
	updated_at: string;
}

export interface NoteShare {
	id: string;
	note_id: string;
	note: Note;
	shared_by_user_id: string;
	shared_with_user_id: string;
	permission: Permission;
	expires_at?: string;
	accepted: boolean;
	created_at: string;
	updated_at: string;
}


// Task Types

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskType = 'task' | 'reminder' | 'deadline';

export interface Task {
	id: string;
	user_id: string;
	note_id?: string;
	title: string;
	description?: string;
	type: TaskType;
	status: TaskStatus;
	priority: TaskPriority;
	start_at?: string;
	end_at?: string;
	due_at?: string;
	reminder_at?: string;
	completed_at?: string;
	is_all_day: boolean;
	recurrence_rule?: string;
	color?: string;
	created_at: string;
	updated_at: string;
}

export type CreateTask = {
	note_id?: string;
	title: string;
	description?: string;
	type?: TaskType;
	status?: TaskStatus;
	priority?: TaskPriority;
	start_at?: string;
	end_at?: string;
	due_at?: string;
	reminder_at?: string;
	is_all_day?: boolean;
	recurrence_rule?: string;
	color?: string;
};

export type UpdateTaskPayload = Partial<CreateTask & { completed_at: string }>;

export interface PaginatedTasksResponse {
	results: Task[];
	nextPage: number | null;
	hasNextPage: boolean;
}


// Event Types
export type EventRepeat = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Event {
	id: string;
	user_id: string;
	title: string;
	description?: string;
	start_date: string;
	end_date?: string;
	is_all_day: boolean;
	repeat: EventRepeat;
	reminder?: string;
	timezone?: string;
	created_at: string;
	updated_at: string;
}

export type CreateEvent = {
	title: string;
	description?: string;
	start_date: string;
	end_date?: string;
	is_all_day?: boolean;
	repeat?: EventRepeat;
	reminder?: string;
	timezone?: string;
};

export type UpdateEventPayload = Partial<CreateEvent>;

export interface PaginatedEventsResponse {
	results: Event[];
	nextPage: number | null;
	hasNextPage: boolean;
}

// =============================================================================
// File Types
// =============================================================================

export interface File {
	id: string;
	user_id: string;
	name: string;
	original_name: string;
	path: string;
	disk: string;
	mime_type: string;
	size: number;
	extension: string;
	metadata?: Record<string, unknown>;
	url: string;
	created_at: string;
	updated_at: string;
}

export type CreateFile = {
	file: globalThis.File;
	note_id?: string;
};

export interface PaginatedFilesResponse {
	results: File[];
	nextPage: number | null;
	hasNextPage: boolean;
}

// =============================================================================
// UI Types
// =============================================================================

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
