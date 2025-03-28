import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from "../services/NoteService";
import { Tag, UserNote, UserNoteData } from "types/types";


interface NoteContextType {
  search: string;
  title: string;
  notes: (UserNote | UserNoteData)[];
  pinnedNotes: (UserNote | UserNoteData)[];
  searchNotes: (UserNote | UserNoteData)[];
  favoriteNotes: (UserNote | UserNoteData)[];
  archiveNotes: (UserNote | UserNoteData)[];
  trashNotes: (UserNote | UserNoteData)[];
  selectedNote: UserNote | null;
  isLoading: boolean;
  tagNotes: (UserNote | UserNoteData)[];
  error: any;
  otherNotes: (UserNote | UserNoteData)[];
  setTagNotes: React.Dispatch<
    React.SetStateAction<(UserNote | UserNoteData)[]>
  >;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  fetchNotes: () => Promise<void>;
  handleSearch: () => void;
  addNote: (note: UserNoteData) => Promise<void>;
  editNote: (newNote: UserNote) => Promise<void>;
  removeNote: (note: UserNote) => Promise<void>;
  handleArchive: (note: UserNote) => void;
  handleFavorite: (note: UserNote) => void;
  handleTrash: (note: UserNote) => void;
  handlePin: (note: UserNote) => void;
  setSelectedNote: React.Dispatch<React.SetStateAction<UserNote | null>>;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  setPinnedNotes: React.Dispatch<
    React.SetStateAction<(UserNote | UserNoteData)[]>
  >;
  setFavoriteNotes: React.Dispatch<
    React.SetStateAction<(UserNote | UserNoteData)[]>
  >;
  setArchiveNotes: React.Dispatch<
    React.SetStateAction<(UserNote | UserNoteData)[]>
  >;
  setTrashNotes: React.Dispatch<
    React.SetStateAction<(UserNote | UserNoteData)[]>
  >;
  handleTagClick: (tag: Tag) => void;
  setOtherNotes: React.Dispatch<
    React.SetStateAction<(UserNote | UserNoteData)[]>
  >;
}

type NoteProviderProps= PropsWithChildren;

const NoteContext = createContext<NoteContextType | undefined>(undefined);

// Categorize notes based on various flags.
const categorizedNotes = (notesArray: (UserNote | UserNoteData)[]) => {
  const pinned: (UserNote | UserNoteData)[] = [];
  const favorites: (UserNote | UserNoteData)[] = [];
  const archived: (UserNote | UserNoteData)[] = [];
  const trashed: (UserNote | UserNoteData)[] = [];
  const filtered: (UserNote | UserNoteData)[] = [];
  const other: (UserNote | UserNoteData)[] = [];

  notesArray.forEach((note: UserNote | UserNoteData) => {
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
  });

  return { pinned, favorites, archived, trashed, filtered, other };
};

const NoteProvider = ({ children }: NoteProviderProps) => {
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("Notes");
  const [otherNotes, setOtherNotes] = useState<(UserNote | UserNoteData)[]>([]);
  const [tagNotes, setTagNotes] = useState<(UserNote | UserNoteData)[]>([]);
  const [notes, setNotes] = useState<(UserNote | UserNoteData)[]>([]);
  const [searchNotes, setSearchNotes] = useState<(UserNote | UserNoteData)[]>(
    []
  );
  const [pinnedNotes, setPinnedNotes] = useState<(UserNote | UserNoteData)[]>(
    []
  );
  const [favoriteNotes, setFavoriteNotes] = useState<
    (UserNote | UserNoteData)[]
  >([]);
  const [archiveNotes, setArchiveNotes] = useState<(UserNote | UserNoteData)[]>(
    []
  );
  const [trashNotes, setTrashNotes] = useState<(UserNote | UserNoteData)[]>([]);
  const [selectedNote, setSelectedNote] = useState<UserNote | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  // Type guard to distinguish between UserNote and UserNoteData.
  const isUserNote = (note: UserNote | UserNoteData): note is UserNote => {
    return (note as UserNote).note !== undefined;
  };

  const handleSearch = () => {
    const query = search.trim().toLowerCase();
    switch (title) {
      case "":
      case "Notes":
        setSearchNotes(
          notes.filter((note) =>
            isUserNote(note)
              ? note.note.title.toLowerCase().includes(query)
              : note.note_data.title.toLowerCase().includes(query)
          )
        );
        break;
      case "Favorites":
        setSearchNotes(
          favoriteNotes.filter((note) =>
            isUserNote(note)
              ? note.note.title.toLowerCase().includes(query)
              : note.note_data.title.toLowerCase().includes(query)
          )
        );
        break;
      case "Archive":
        setSearchNotes(
          archiveNotes.filter((note) =>
            isUserNote(note)
              ? note.note.title.toLowerCase().includes(query)
              : note.note_data.title.toLowerCase().includes(query)
          )
        );
        break;
      case "Trash":
        setSearchNotes(
          trashNotes.filter((note) =>
            isUserNote(note)
              ? note.note.title.toLowerCase().includes(query)
              : note.note_data.title.toLowerCase().includes(query)
          )
        );
        break;
      default:
        setSearchNotes(
          tagNotes.filter((note) =>
            isUserNote(note)
              ? note.note.title.toLowerCase().includes(query)
              : note.note_data.title.toLowerCase().includes(query)
          )
        );
        break;
    }
  };

  const handleTagClick = (tag: Tag) => {
    setTagNotes(
      notes.filter(
        (note) =>
          note.tags.includes(tag.id!) && !note.is_trashed && !note.is_archived
      )
    );
  };

  const handleFavorite = (note: UserNote) => {
    const updatedNote = { ...note, is_favorited: !note.is_favorited };
    editNote(updatedNote);
  };

  const handleTrash = (note: UserNote) => {
    const updatedNote = { ...note, is_trashed: !note.is_trashed };
    editNote(updatedNote);
  };

  const handleArchive = (note: UserNote) => {
    const updatedNote = { ...note, is_archived: !note.is_archived };
    editNote(updatedNote);
  };

  const handlePin = (note: UserNote) => {
    const updatedNote = { ...note, is_pinned: !note.is_pinned };
    editNote(updatedNote);
  };

  const refreshCategorizedNotes = (notesArray: (UserNote | UserNoteData)[]) => {
    setNotes(notesArray);
    const { pinned, favorites, archived, trashed, filtered, other } =
      categorizedNotes(notesArray);
    setOtherNotes(other);
    setSearchNotes(filtered);
    setPinnedNotes(pinned);
    setFavoriteNotes(favorites);
    setArchiveNotes(archived);
    setTrashNotes(trashed);
  };

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedNotes = await getNotes();
      refreshCategorizedNotes(fetchedNotes);
    } catch (e: any) {
      setError(e.message || "Error fetching notes");
    } finally {
      setLoading(false);
    }
  }, []);

  const addNote = async (note: UserNoteData) => {
    const previousNotes = [...notes];
    refreshCategorizedNotes([...notes, note]);
    try {
      setLoading(true);
      setError(null);
      const response = await createNote(note);
      if (!response || !(response >= 200 && response < 300)) {
        throw new Error("Failed to add note on server");
      }
    } catch (e: any) {
      setError(e.message || "Error adding note");
      refreshCategorizedNotes(previousNotes);
    } finally {
      setLoading(false);
    }
  };

  const editNote = async (newNote: UserNote) => {
    const previousNotes = [...notes];
    const updatedNotes = notes.map((n) => (n.id === newNote.id ? newNote : n));
    refreshCategorizedNotes(updatedNotes);
    try {
      setLoading(true);
      setError(null);
      const response = await updateNote(newNote);
      if (!response || !(response >= 200 && response < 300)) {
        throw new Error("Failed to update note on server");
      }
    } catch (e: any) {
      setError(e.message || "Error updating note");
      refreshCategorizedNotes(previousNotes);
    } finally {
      setLoading(false);
    }
  };

  const removeNote = async (note: UserNote) => {
    const previousNotes = [...notes];
    const updatedNotes = notes.filter((n) => n.id !== note.id);
    refreshCategorizedNotes(updatedNotes);
    try {
      setLoading(true);
      setError(null);
      const response = await deleteNote(note);
      if (!response || !(response >= 200 && response < 300)) {
        throw new Error("Failed to remove note on server");
      }
    } catch (e: any) {
      setError(e.message || "Error deleting note");
      refreshCategorizedNotes(previousNotes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("access_token") != null) {
      fetchNotes();
    }
  }, [fetchNotes]);

  return (
    <NoteContext.Provider
      value={{
        search,
        title,
        notes,
        pinnedNotes,
        searchNotes,
        favoriteNotes,
        archiveNotes,
        trashNotes,
        selectedNote,
        isLoading,
        tagNotes,
        error,
        otherNotes,
        setTagNotes,
        setTitle,
        fetchNotes,
        handleSearch,
        addNote,
        editNote,
        removeNote,
        handleArchive,
        handleFavorite,
        handleTrash,
        handlePin,
        setSelectedNote,
        setSearch,
        setPinnedNotes,
        setFavoriteNotes,
        setArchiveNotes,
        setTrashNotes,
        handleTagClick,
        setOtherNotes,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};

const useNote = () => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error("useNote must be used within a NoteProvider");
  }
  return context;
};

export { NoteContext, NoteProvider };
export default useNote;
