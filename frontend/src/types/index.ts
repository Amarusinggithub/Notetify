import "axios";

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}


export const CSRF_TOKEN_COOKIE_NAME = "csrftoken";
export const USERDATA_STORAGE_KEY = "userData";
export interface UserNote {
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
}

export interface UserNoteData {
  id: number;
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
}

export interface Tag {
  id?: number;
  name: string;
  users?: number[];
}
