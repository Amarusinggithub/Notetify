import { CreateNote, NoteAction, UserNote } from '../types';

// Type guard to distinguish between UserNote and UserNoteData.
export const isUserNote = (note: UserNote | CreateNote): note is UserNote => {
	return (note as UserNote).note !== undefined;
};

export const initialNoteState: CreateNote = {
	note_data: { title: '', content: '', users: [] },
	is_archived: false,
	is_favorited: false,
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
		case 'TOGGLE_ARCHIVED':
			return { ...state, is_archived: !state.is_archived};
		case 'TOGGLE_ARCHIVED':
			return { ...state, is_pinned: !state.is_pinned};
		case 'TOGGLE_ARCHIVED':
			return { ...state, is_favorited: !state.is_favorited};
		case 'TOGGLE_ARCHIVED':
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
		case 'TOGGLE_ARCHIVED':
			return { ...state, is_archived: !state.is_archived };
		case 'TOGGLE_ARCHIVED':
			return { ...state, is_pinned: !state.is_pinned };
		case 'TOGGLE_ARCHIVED':
			return { ...state, is_favorited: !state.is_favorited };
		case 'TOGGLE_ARCHIVED':
			return { ...state, is_trashed: !state.is_trashed };
		default:
			return state;
	}
}
