import "axios";
import type { LucideIcon } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

export const CSRF_TOKEN_COOKIE_NAME = "XSRF-TOKEN";

// ─── Shared primitives ────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
    results: T[];
    nextPage: number | null;
    hasNextPage: boolean;
}

// ─── Enum-like unions (mirror backend enums/string columns) ───────────────────

export type Permission = "view" | "comment" | "edit";
export type OAuthProvider = "google" | "github" | "facebook";
export type Theme = "dark" | "light" | "system";
export type Language = "en" | "de" | "es" | "fr" | "ja";

export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskType = "task" | "reminder" | "deadline";

export type EventRepeat = "none" | "daily" | "weekly" | "monthly" | "yearly";

export type SortBy =
    | "updated_at"
    | "created_at"
    | "is_pinned_in_notebook"
    | "is_pinned_in_space"
    | "is_pinned_to_home"
    | "pinned_in_notebook_at"
    | "pinned_in_space_at"
    | "pinned_to_home_at"
    | "is_trashed";

// ─── Auth & User ──────────────────────────────────────────────────────────────

export interface OAuthAccount {
    id: string;
    user_id: string;
    provider: OAuthProvider;
    provider_user_id: string;
    token_expires_at: string | null;
    name: string | null;
    email: string | null;
    avatar: string | null;
    created_at: string;
    updated_at: string;
}

export type CreateOAuthAccount = {
    provider: OAuthProvider;
    provider_user_id: string;
    token_expires_at?: string;
    name?: string;
    email?: string;
    avatar?: string;
};

export type CreateUser = {
    first_name?: string;
    last_name?: string;
    email: string;
    password?: string;
};

export interface User extends Omit<CreateUser, "password"> {
    id: string;

    first_name: string;
    last_name: string;
    full_name: string;

    is_active: boolean;
    is_verified: boolean;
    email_verified_at: string | null;

    remember?: boolean;
    two_factor_secret: string | null;
    two_factor_recovery_codes: string[] | null;
    two_factor_confirmed_at: string | null;

    avatar: string | null;
    timezone: string;
    locale: string;
    preferred_language: string | null;

    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    last_login_at: string | null;
    last_login_ip: string | null;

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

// ─── Tags ─────────────────────────────────────────────────────────────────────

export interface Tag {
    id: string;
    user_id: string;
    name: string;
    color: string | null;
    order: number | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export type CreateTag = {
    name: string;
    color?: string;
};

export type UpdateTagPayload = Partial<{
    name: string;
    color: string | null;
    order: number;
}>;

export type PaginatedTagsResponse = PaginatedResponse<Tag>;

// ─── Spaces ───────────────────────────────────────────────────────────────────

export interface Space {
    id: string;
    created_by_user_id: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    is_shared: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface UserSpace {
    id: string;
    user_id: string;
    space_id: string;
    space: Space;
    is_owner: boolean;
    permission: Permission | null;
    is_shared: boolean;
    is_trashed: boolean;
    trashed_at: string | null;
    order: number | null;
    created_at: string;
    updated_at: string;
}

export type CreateSpace = {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
};

export type UpdateSpacePayload = Partial<{
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
}>;

export type UpdateUserSpacePayload = Partial<{
    is_trashed: boolean;
    order: number;
}>;

export type PaginatedSpacesResponse = PaginatedResponse<UserSpace>;

// ─── Notebooks ────────────────────────────────────────────────────────────────

export interface Notebook {
    id: string;
    created_by_user_id: string;
    space_id: string | null;
    name: string;
    is_shared: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface UserNotebook {
    id: string;
    user_id: string;
    notebook_id: string;
    notebook: Notebook;
    is_owner: boolean;
    is_shared: boolean;
    is_pinned_in_space: boolean;
    pinned_in_space_at: string | null;
    is_pinned_to_home: boolean;
    pinned_to_home_at: string | null;
    is_trashed: boolean;
    trashed_at: string | null;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export type CreateNotebook = {
    name: string;
    space_id?: string;
};

export type UpdateNotebookPayload = Partial<{
    name: string;
    space_id: string | null;
}>;

export type UpdateUserNotebookPayload = Partial<{
    is_pinned_in_space: boolean;
    is_pinned_to_home: boolean;
    is_trashed: boolean;
    is_default: boolean;
    order: number;
}>;

export type PaginatedNotebooksResponse = PaginatedResponse<UserNotebook>;

// ─── Notes ────────────────────────────────────────────────────────────────────

export interface Note {
    id: string;
    created_by_user_id: string;
    content: Record<string, unknown> | null;
    is_shared: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface UserNote {
    id: string;
    user_id: string;
    note_id: string;
    note: Note;
    notebook_id: string | null;
    is_owner: boolean;
    is_shared: boolean;
    order: number | null;
    is_pinned_in_notebook: boolean;
    pinned_in_notebook_at: string | null;
    is_pinned_in_space: boolean;
    pinned_in_space_at: string | null;
    is_pinned_to_home: boolean;
    pinned_to_home_at: string | null;
    is_trashed: boolean;
    trashed_at: string | null;
    created_at: string;
    updated_at: string;
}

export type CreateNote = {
    notebook_id?: string;
};

export type UpdateUserNotePayload = Partial<{
    notebook_id: string | null;
    is_pinned_in_notebook: boolean;
    is_pinned_in_space: boolean;
    is_pinned_to_home: boolean;
    is_trashed: boolean;
    order: number;
}>;

export type PaginatedNotesResponse = PaginatedResponse<UserNote>;

// ─── Collab ───────────────────────────────────────────────────────────────────

export interface CollabSession {
    token: string;
    wsUrl: string;
    docId: string;
}

// ─── Shares ───────────────────────────────────────────────────────────────────
export interface NoteShare {
    id: string;
    note_id: string;
    note: Note;
    shared_by_user_id: string;
    shared_with_user_id: string;
    permission: Permission;
    expires_at: string | null;
    accepted: boolean;
    accepted_at: string | null;
    is_highlighted: boolean;
    highlighted_at: string | null;
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
    expires_at: string | null;
    accepted: boolean;
    accepted_at: string | null;
    is_highlighted: boolean;
    highlighted_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface SpaceShare {
    id: string;
    space_id: string;
    space: Space;
    shared_by_user_id: string;
    shared_with_user_id: string;
    permission: Permission;
    expires_at: string | null;
    accepted: boolean;
    accepted_at: string | null;
    created_at: string;
    updated_at: string;
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export interface Task {
    id: string;
    user_id: string;
    note_id: string | null;
    title: string;
    description: string | null;
    type: TaskType;
    status: TaskStatus;
    priority: TaskPriority;
    start_at: string | null;
    end_at: string | null;
    due_at: string | null;
    reminder_at: string | null;
    completed_at: string | null;
    is_all_day: boolean;
    recurrence_rule: string | null;
    color: string | null;
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

export type PaginatedTasksResponse = PaginatedResponse<Task>;

// ─── Events ───────────────────────────────────────────────────────────────────

export interface Event {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string | null;
    is_all_day: boolean;
    repeat: EventRepeat;
    reminder: string | null;
    timezone: string | null;
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

export type PaginatedEventsResponse = PaginatedResponse<Event>;

// ─── Files ────────────────────────────────────────────────────────────────────

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
    metadata: Record<string, unknown> | null;
    url: string;
    created_at: string;
    updated_at: string;
}

export type CreateFile = {
    file: globalThis.File;
    note_id?: string;
};

export type PaginatedFilesResponse = PaginatedResponse<File>;

// ─── UI ───────────────────────────────────────────────────────────────────────

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
