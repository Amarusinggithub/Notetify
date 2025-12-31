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

export type FormErrors = Partial<Record<string, string[]>>;

// Map Axios error responses into field-based errors for forms
export function mapAxiosErrorToFieldErrors(error: any): FormErrors {
	const toField = (key: string, msg: string): FormErrors => ({ [key]: [msg] });

	// Network or request-level errors
	if (!error?.response) {
		if (
			error?.code === 'NETWORK_ERROR' ||
			error?.message?.includes('Network Error')
		) {
			return toField(
				'general',
				'Network error. Please check your internet connection.',
			);
		}
		if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
			return toField('general', 'Request timeout. Please try again.');
		}
		return toField('general', 'Connection error. Please try again.');
	}

	const { status, data } = error.response as { status: number; data?: any };

	// Common Laravel-style validation structure: { errors: { field: [messages] } }
	const normalizedFieldErrors = (): FormErrors | null => {
		if (!data?.errors) return null;
		const fe: FormErrors = {};
		for (const [field, messages] of Object.entries<any>(data.errors)) {
			if (!messages) continue;
			fe[field] = Array.isArray(messages) ? messages : [String(messages)];
		}
		return fe;
	};

	switch (status) {
		case 400:
		case 422: {
			const fe = normalizedFieldErrors();
			if (fe && Object.keys(fe).length > 0) return fe;
			if (data?.message) return toField('general', data.message);
			if (data?.detail) return toField('general', data.detail);
			return toField('general', 'Invalid request. Please check your input.');
		}
		case 401:
			// Auth-specific: surface under password to show near the form
			return toField(
				'password',
				data?.message || 'Invalid credentials. Please try again.',
			);
		case 403:
			return toField('general', data?.message || 'Access forbidden.');
		case 404:
			return toField('general', 'Resource not found. Please try again.');
		case 409:
			// If backend sends a conflict without field details, attach to email by default for auth flows
			return toField(
				'email',
				data?.message || 'Conflict error. This resource may already exist.',
			);
		case 429:
			return toField('general', 'Too many requests. Please try again later.');
		case 500:
			return toField('general', 'Server error. Please try again later.');
		case 502:
		case 503:
		case 504:
			return toField(
				'general',
				'Service temporarily unavailable. Please try again later.',
			);
		default:
			if (data?.message) return toField('general', data.message);
			if (data?.detail) return toField('general', data.detail);
			return toField(
				'general',
				`An error occurred (${status}). Please try again.`,
			);
	}
}
