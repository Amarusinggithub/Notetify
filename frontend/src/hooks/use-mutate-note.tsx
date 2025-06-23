import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, {
	createContext,
	PropsWithChildren,
	useContext,
	useState,
} from 'react';
import { createNote, deleteNote, updateNote } from '../lib/note-service.ts';
import { CreateNote, noteQueryKeys, UserNote } from '../types/index.ts';

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
