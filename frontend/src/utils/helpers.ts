import { type CreateNote, type NoteAction, type UserNote } from '../types';

// Type guard to distinguish between UserNote and UserNoteData.
export const isUserNote = (note: UserNote | CreateNote): note is UserNote => {
	return (note as UserNote).note !== undefined;
};

export const initialNoteState: CreateNote = {
	note_data: { title: '', content: '', users: [] },
	is_favorite: false,
	is_pinned: false,
	is_trashed: false,
	tags: [],
};

export function createNoteReducer(state: CreateNote, action: NoteAction) {
	switch (action.type) {
		case 'SET_TITLE':
			return {
				...state,
				note_data: { ...state.note_data, title: action.payload },
			};
		case 'SET_CONTENT':
			return {
				...state,
				note_data: { ...state.note_data, content: action.payload },
			};
		
		case 'TOGGLE_PINNED':
			return { ...state, is_pinned: !state.is_pinned };
		case 'TOGGLE_FAVORITE':
			return { ...state, is_favorite: !state.is_favorite };
		case 'TOGGLE_TRASHED':
			return { ...state, is_trashed: !state.is_trashed };
		case 'RESET':
			return initialNoteState;
		default:
			return state;
	}
}

export function userNoteReducer(state: UserNote, action: NoteAction) {
	switch (action.type) {
		case 'SET_TITLE':
			return {
				...state,
				note: { ...state.note, title: action.payload },
			};
		case 'SET_CONTENT':
			return {
				...state,
				note: { ...state.note, content: action.payload },
			};
		
		case 'TOGGLE_PINNED':
			return { ...state, is_pinned: !state.is_pinned };
		case 'TOGGLE_FAVORITE':
			return { ...state, is_favorite: !state.is_favorite };
		case 'TOGGLE_TRASHED':
			return { ...state, is_trashed: !state.is_trashed };
		default:
			return state;
	}
}
