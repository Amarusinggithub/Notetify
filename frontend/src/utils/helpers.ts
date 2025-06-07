import { CreateNote, UserNote } from '../types';

// Type guard to distinguish between UserNote and UserNoteData.
export const isUserNote = (note: UserNote | CreateNote): note is UserNote => {
	return (note as UserNote).note !== undefined;
};
