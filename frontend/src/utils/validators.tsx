import { UserNote, UserNoteData } from "types/types";

export const isUserNote = (note: UserNote | UserNoteData): note is UserNote => {
  return (note as UserNote).note !== undefined;
};
