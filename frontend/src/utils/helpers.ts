import { CreateNote, Note } from '../types';

// Type guard to distinguish between UserNote and UserNoteData.
export const isUserNote = (note: Note | CreateNote): note is Note => {
	return (note as Note).note !== undefined;
};
