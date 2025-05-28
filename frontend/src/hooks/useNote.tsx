import {
	QueryObserverResult,
	RefetchOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import React, {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react';
import {
	createNote,
	deleteNote,
	getNotes,
	updateNote,
} from '../lib/NoteService.ts';
import { CreateNote, Note, Tag } from '../types/index.ts';
import { isUserNote } from './../utils/helpers';
import { useAuth } from './useAuth.tsx';

interface NoteContextType {
	search: string;
	title: string;
	searchNotes: (Note | CreateNote)[];
	selectedNote: Note | null;
	isLoading: boolean;
	tagNotes: (Note | CreateNote)[];
	isError: any;
	pinned: (Note | CreateNote)[];
	favorites: (Note | CreateNote)[];
	archived: (Note | CreateNote)[];
	trashed: (Note | CreateNote)[];
	filtered: (Note | CreateNote)[];
	other: (Note | CreateNote)[];
	data: (Note | CreateNote)[];
	setTagNotes: React.Dispatch<React.SetStateAction<(Note | CreateNote)[]>>;
	refetch: (
		options?: RefetchOptions,
	) => Promise<QueryObserverResult<any, Error>>;
	setPage: React.Dispatch<React.SetStateAction<string>>;
	handleSearch: (search: string | undefined) => void;
	addNote: (note: CreateNote) => Promise<void>;
	editNote: (newNote: Note) => Promise<void>;
	removeNote: (note: Note) => Promise<void>;
	handleArchive: (note: Note) => void;
	handleFavorite: (note: Note) => void;
	handleTrash: (note: Note) => void;
	handlePin: (note: Note) => void;
	setSelectedNote: React.Dispatch<React.SetStateAction<Note | null>>;
	handleTagClick: (tag: Tag) => void;
	setSearch: React.Dispatch<React.SetStateAction<string>>;
}

type NoteProviderProps = PropsWithChildren;

const NoteContext = createContext<NoteContextType | undefined>(undefined);

const categorizedNotes = (notesArray: (Note | CreateNote)[]) => {
	const pinned: (Note | CreateNote)[] = [];
	const favorites: (Note | CreateNote)[] = [];
	const archived: (Note | CreateNote)[] = [];
	const trashed: (Note | CreateNote)[] = [];
	const filtered: (Note | CreateNote)[] = [];
	const other: (Note | CreateNote)[] = [];

	for (let i = 0; i < notesArray.length; i++) {
		let note = notesArray[i];
		if (note.is_pinned && !note.is_trashed && !note.is_archived) {
			pinned.push(note);
		}
		if (note.is_favorited && !note.is_trashed && !note.is_archived) {
			favorites.push(note);
		}
		if (note.is_archived && !note.is_trashed) {
			archived.push(note);
		}
		if (note.is_trashed && !note.is_archived) {
			trashed.push(note);
		}
		if (!note.is_trashed && !note.is_archived && !note.is_pinned) {
			filtered.push(note);
			other.push(note);
		}
	}

	return { pinned, favorites, archived, trashed, filtered, other };
};

const NoteProvider = ({ children }: NoteProviderProps) => {
	const { isAuthenticated } = useAuth();
	const queryClient = useQueryClient();
	const {
		data = [],
		isError,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ['notes'],
		queryFn: getNotes,
		enabled: isAuthenticated,
	});

	const { pinned, favorites, archived, trashed, filtered, other } =
		useMemo(() => {
			return categorizedNotes(data);
		}, [data]);

	const [page, setPage] = useState('Notes');
	const [search, setSearch] = useState('');
	const [tagNotes, setTagNotes] = useState<(Note | CreateNote)[]>([]);
	const [searchNotes, setSearchNotes] = useState<(Note | CreateNote)[]>([]);
	const [selectedNote, setSelectedNote] = useState<Note | null>(null);

	const handleSearch = useCallback(
		async (search: string | undefined) => {
			const query = search!.trim().toLowerCase();
			let sourcedNotes: (Note | CreateNote)[] = [];
			switch (page) {
				case 'Notes':
					sourcedNotes = [...other, ...pinned];
					break;
				case 'Favorites':
					sourcedNotes = favorites;
					break;
				case 'Archive':
					sourcedNotes = archived;
					break;
				case 'Trash':
					sourcedNotes = trashed;
					break;
				default:
					sourcedNotes = tagNotes;
					break;
			}

			const filteredNotes = sourcedNotes.filter((note) =>
				isUserNote(note)
					? note.note.title.trim().toLowerCase().includes(query)
					: note.note_data.title.trim().toLowerCase().includes(query),
			);
			setSearchNotes(filteredNotes);
		},
		[
			page,
			other,
			pinned,
			favorites,
			archived,
			trashed,
			tagNotes,
			setSearchNotes,
		],
	);

	const handleTagClick = (tag: Tag) => {
		setTagNotes(
			data.filter(
				(note: Note | CreateNote) =>
					note.tags.includes(tag.id!) && !note.is_trashed && !note.is_archived,
			),
		);
	};

	const handleFavorite = (note: Note) => {
		const updatedNote = { ...note, is_favorited: !note.is_favorited };
		editNote(updatedNote);
	};

	const handleTrash = (note: Note) => {
		const updatedNote = { ...note, is_trashed: !note.is_trashed };
		editNote(updatedNote);
	};

	const handleArchive = (note: Note) => {
		const updatedNote = { ...note, is_archived: !note.is_archived };
		editNote(updatedNote);
	};

	const handlePin = (note: Note) => {
		const updatedNote = { ...note, is_pinned: !note.is_pinned };
		editNote(updatedNote);
	};

	const addNoteMutation = useMutation({
		mutationFn: createNote,
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ['notes'] });
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
			queryClient.invalidateQueries({ queryKey: ['notes'] });
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
			queryClient.invalidateQueries({ queryKey: ['notes'] });
		},
	});

	const removeNote = async (note: Note) => {
		removeNoteMutation.mutate(note);
	};

	return (
		<NoteContext.Provider
			value={{
				search,
				pinned,
				favorites,
				archived,
				trashed,
				filtered,
				other,
				title: page,
				searchNotes,
				selectedNote,
				isLoading,
				tagNotes,
				isError,
				data,
				setTagNotes,
				setPage,
				handleSearch,
				addNote,
				editNote,
				removeNote,
				handleArchive,
				handleFavorite,
				handleTrash,
				handlePin,
				setSelectedNote,
				handleTagClick,
				refetch,
				setSearch,
			}}
		>
			{children}
		</NoteContext.Provider>
	);
};

const useNote = () => {
	const context = useContext(NoteContext);
	if (!context) {
		throw new Error('useNote must be used within a NoteProvider');
	}
	return context;
};

export { NoteContext, NoteProvider };
export default useNote;
