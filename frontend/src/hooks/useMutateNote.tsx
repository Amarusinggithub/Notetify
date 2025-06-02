import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, {
	createContext,
	PropsWithChildren,
	useContext,
	useState,
} from 'react';
import { createNote, deleteNote, updateNote } from '../lib/NoteService.ts';
import { CreateNote, Note, noteQueryKeys } from '../types/index.ts';

interface NoteContextType {
	selectedNote: Note | null;

	addNote: (note: CreateNote) => Promise<void>;
	editNote: (newNote: Note) => Promise<void>;
	removeNote: (note: Note) => Promise<void>;
	handleArchive: (note: Note) => void;
	handleFavorite: (note: Note) => void;
	handleTrash: (note: Note) => void;
	handlePin: (note: Note) => void;
	setSelectedNote: React.Dispatch<React.SetStateAction<Note | null>>;
}

type NoteProviderProps = PropsWithChildren;

const NoteContext = createContext<NoteContextType | undefined>(undefined);

const NoteProvider = ({ children }: NoteProviderProps) => {
	const queryClient = useQueryClient();

	const [selectedNote, setSelectedNote] = useState<Note | null>(null);

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

	const editNote = async (note: Note) => {
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

	const removeNote = async (note: Note) => {
		removeNoteMutation.mutate(note);
	};

	const handleToggle = (
		note: Note,
		field: keyof Pick<
			Note,
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
