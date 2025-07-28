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

export const colors = [
	'#958DF1',
	'#F98181',
	'#FBBC88',
	'#FAF594',
	'#70CFF8',
	'#94FADB',
	'#B9F18D',
	'#C3E2C2',
	'#EAECCC',
	'#AFC8AD',
	'#EEC759',
	'#9BB8CD',
	'#FF90BC',
	'#FFC0D9',
	'#DC8686',
	'#7ED7C1',
	'#F3EEEA',
	'#89B9AD',
	'#D0BFFF',
	'#FFF8C9',
	'#CBFFA9',
	'#9BABB8',
	'#E3F4F4',
];
export const names = [
	'Lea Thompson',
	'Cyndi Lauper',
	'Tom Cruise',
	'Madonna',
	'Jerry Hall',
	'Joan Collins',
	'Winona Ryder',
	'Christina Applegate',
	'Alyssa Milano',
	'Molly Ringwald',
	'Ally Sheedy',
	'Debbie Harry',
	'Olivia Newton-John',
	'Elton John',
	'Michael J. Fox',
	'Axl Rose',
	'Emilio Estevez',
	'Ralph Macchio',
	'Rob Lowe',
	'Jennifer Grey',
	'Mickey Rourke',
	'John Cusack',
	'Matthew Broderick',
	'Justine Bateman',
	'Lisa Bonet',
];

export const defaultContent = `
  <p>Hi 👋, this is a collaborative document.</p>
  <p>Feel free to edit and collaborate in real-time!</p>
`;

export const getRandomElement = (list) =>
	list[Math.floor(Math.random() * list.length)];

export const getRandomColor = () => getRandomElement(colors);
const getRandomName = () => getRandomElement(names);

export const getInitialUser = () => {
	return {
		name: getRandomName(),
		color: getRandomColor(),
	};
};

export function mapErrorToMessage(error: any): string[] {
	// Network errors
	if (!error.response) {
		if (
			error.code === 'NETWORK_ERROR' ||
			error.message?.includes('Network Error')
		) {
			return ['Network error. Please check your internet connection.'];
		}
		if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
			return ['Request timeout. Please try again.'];
		}
		return ['Connection error. Please try again.'];
	}

	const { status, data } = error.response;

	switch (status) {
		case 400:
			if (data?.errors) {
				return Array.isArray(data.errors) ? data.errors : [data.errors];
			}
			if (data?.message) return [data.message];
			if (data?.detail) return [data.detail];
			return ['Invalid request. Please check your input.'];

		case 401:
			if (data?.message) return [data.message];
			return ['Invalid credentials. Please try again.'];

		case 403:
			if (data?.message) return [data.message];
			return ['Access forbidden. Your account may be locked or inactive.'];

		case 404:
			return ['Resource not found. Please try again.'];

		case 409:
			if (data?.message) return [data.message];
			return ['Conflict error. This resource may already exist.'];

		case 422:
			if (data?.errors) {
				// Handle validation errors from backend
				const errors = [];
				for (const [field, messages] of Object.entries(data.errors)) {
					if (Array.isArray(messages)) {
						errors.push(...messages.map((msg) => `${field}: ${msg}`));
					} else {
						errors.push(`${field}: ${messages}`);
					}
				}
				return errors;
			}
			if (data?.message) return [data.message];
			return ['Validation error. Please check your input.'];

		case 429:
			return ['Too many requests. Please wait a moment and try again.'];

		case 500:
			return ['Server error. Please try again later.'];

		case 502:
		case 503:
		case 504:
			return ['Service temporarily unavailable. Please try again later.'];

		default:
			if (data?.message) return [data.message];
			if (data?.detail) return [data.detail];
			return [`An error occurred (${status}). Please try again.`];
	}
}
