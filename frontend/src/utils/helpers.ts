import { UserNote, UserNoteData } from '../types';

// Type guard to distinguish between UserNote and UserNoteData.
export const isUserNote = (note: UserNote | UserNoteData): note is UserNote => {
  return (note as UserNote).note !== undefined;
};
