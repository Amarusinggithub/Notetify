import axiosInstance from "./AxiosService.ts";
import { UserNote, UserNoteData } from "types/index.ts";

export const getNotes = async () => {
  try {
    const response = await axiosInstance.get("api/notes/");
    console.log(response.data);
    return response.data;
  } catch (e) {
    console.error(e);
  }
};
export const createNote = async (note: UserNoteData) => {
  try {
    const response = await axiosInstance.post("api/notes/create_note/", {
      note_data: note.note_data,
      tags: note.tags,
      is_pinned: note.is_pinned,
      is_trashed: note.is_trashed,
      is_archived: note.is_archived,
      is_favorited: note.is_favorited,
    });
    return response.status;
  } catch (e) {
    console.error(e);
  }
};

export const updateNote = async (note: UserNote) => {
  console.log("this");
  try {
    const response = await axiosInstance.put(
      `api/notes/edit_note/${note.id}/`,
      {
        id: note.id,
        note: note.note.id,

        note_data: {
          title: note.note.title,
          content: note.note.content,
          users: note.note.users,
        },
        user: note.user,
        tags: note.tags,
        is_pinned: note.is_pinned,
        is_trashed: note.is_trashed,
        is_archived: note.is_archived,
        is_favorited: note.is_favorited,
      }
    );

    return response.status;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteNote = async (note: UserNote) => {
  try {
    const response = await axiosInstance.delete(
      `api/notes/delete_note/${note.id}/`
    );
    return response.status;
  } catch (e) {
    console.error(e);
  }
};
