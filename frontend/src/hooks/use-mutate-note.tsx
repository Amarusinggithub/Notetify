import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, {
	createContext,
	type PropsWithChildren,
	useContext,
	useState,
} from 'react';
import axiosInstance from '../lib/axios.ts';
import {
	type CreateNote,
	noteQueryKeys,
	type UserNote,
} from '../types/index.ts';

interface NoteContextType {
	selectedNote: UserNote | null;

	addNote: (note: CreateNote) => Promise<void>;
	editNote: (newNote: UserNote) => Promise<void>;
	removeNote: (note: UserNote) => Promise<void>;
	handleArchive: (note: UserNote) => void;
	handleFavorite: (note: UserNote) => void;
	handleTrash: (note: UserNote) => void;
	handlePin: (note: UserNote) => void;
	setSelectedNote: React.Dispatch<React.SetStateAction<UserNote | null>>;
}

type NoteProviderProps = PropsWithChildren;

const NoteContext = createContext<NoteContextType | undefined>(undefined);

const NoteProvider = ({ children }: NoteProviderProps) => {
	const queryClient = useQueryClient();

	const [selectedNote, setSelectedNote] = useState<UserNote | null>(null);

	const addNoteMutation = useMutation({
		mutationFn: createNote,
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: [noteQueryKeys.all],
			});
		},
	});

	const addNote = async (note: CreateNote) => {
		if (
			note.note_data.content!.trim().length != 0 &&
			note.note_data.title!.trim().length != 0
		)
			addNoteMutation.mutate(note);
	};

	const editNoteMutation = useMutation({
		mutationFn: updateNote,
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: [noteQueryKeys.all],
			});
		},
	});

	const editNote = async (note: UserNote) => {
		if (
			note.note.content!.trim().length != 0 &&
			note.note.title!.trim().length != 0
		)
			editNoteMutation.mutate(note);
	};

	const removeNoteMutation = useMutation({
		mutationFn: deleteNote,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [noteQueryKeys.all],
			});
		},
	});

	const removeNote = async (note: UserNote) => {
		removeNoteMutation.mutate(note);
	};

	const handleToggle = (
		note: UserNote,
		field: keyof Pick<
			UserNote,
			'is_favorited' | 'is_archived' | 'is_trashed' | 'is_pinned'
		>,
	) => {
		const updated = { ...note, [field]: !note[field] };
		editNote(updated);
	};

	return (
		<NoteContext.Provider
			value={{
				selectedNote,
				addNote,
				editNote,
				removeNote,
				handleArchive: (note) => handleToggle(note, 'is_archived'),
				handleFavorite: (note) => handleToggle(note, 'is_favorited'),
				handleTrash: (note) => handleToggle(note, 'is_trashed'),
				handlePin: (note) => handleToggle(note, 'is_pinned'),
				setSelectedNote,
			}}
		>
			{children}
		</NoteContext.Provider>
	);
};

const useMutateNote = () => {
	const context = useContext(NoteContext);
	if (!context) {
		throw new Error('useMutateNote must be used within a NoteProvider');
	}
	return context;
};

export { NoteContext, NoteProvider };
export default useMutateNote;

export const getNotes = async () => {
	try {
		const response = await axiosInstance.get(
			'notes/?is_pinned=True&is_favorited=True',
		);
		console.log(response.data);
		return response.data;
	} catch (e) {
		console.error(e);
	}
};
export const createNote = async (note: CreateNote) => {
	try {
		const response = await axiosInstance.post('notes/', {
			note_data: note.note_data,
		});
		return response.status;
	} catch (e) {
		console.error(e);
	}
};

export const updateNote = async (note: UserNote) => {
	console.log('this');
	try {
		const response = await axiosInstance.put(`notes/${note.id}/`, {
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
		});

		return response.status;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const deleteNote = async (note: UserNote) => {
	try {
		const response = await axiosInstance.delete(`notes/${note.id}/`);
		return response.status;
	} catch (e) {
		console.error(e);
	}
};
