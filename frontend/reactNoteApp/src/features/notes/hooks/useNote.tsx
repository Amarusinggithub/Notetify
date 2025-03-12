import React, {
  createContext,
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
} from "../services/NoteService.tsx";

interface UserNote {
  id: number;
  note: {
    id: number;
    title: string;
    content: string;
    users: number[];
  };
  user: number;
  tags: number[];
  is_pinned: boolean;
  is_trashed: boolean;
  is_archived: boolean;
  is_favorited: boolean;
}

interface UserNoteData {
  id: number;
  note_data: {
    title: string;
    content: string;
    users: number[];
  };
  tags: number[];
  is_pinned: boolean;
  is_trashed: boolean;
  is_archived: boolean;
  is_favorited: boolean;
}

interface Tag {
  id: number;
  name: string;
  users: number[];
}

const NoteContext = createContext();

const categorizedNotes = (notesArray: (UserNote | UserNoteData)[]) => {
  console.log("this is the categorized notes", notesArray);
  const pinned: (UserNote | UserNoteData)[] = [];
  const favorites: (UserNote | UserNoteData)[] = [];
  const archived: (UserNote | UserNoteData)[] = [];
  const trashed: (UserNote | UserNoteData)[] = [];
  const filtered: (UserNote | UserNoteData)[] = [];

  const other: (UserNote | UserNoteData)[] = [];

  notesArray.forEach((note: UserNote | UserNoteData) => {
    if (
      note.is_pinned &&
      note.is_trashed === false &&
      note.is_archived === false
    ) {
      pinned.push(note);
    }

    if (
      note.is_favorited &&
      note.is_trashed === false &&
      note.is_archived === false
    ) {
      favorites.push(note);
    }

    if (note.is_archived && note.is_trashed === false) {
      archived.push(note);
    }

    if (note.is_trashed && note.is_archived === false) {
      trashed.push(note);
    }

    if (
      note.is_trashed === false &&
      note.is_archived === false &&
      note.is_pinned === false
    ) {
      filtered.push(note);
      other.push(note);
    }
  });

  return { pinned, favorites, archived, trashed, filtered, other };
};

const NoteProvider = ({ children }: any) => {
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
  const [error, setError] = useState(null);


  const isUserNote = (note: UserNote | UserNoteData): note is UserNote => {
    return (note as UserNote).note !== undefined;
  };


  const handleSearch = () => {
    const query = search.trim().toLowerCase();

    switch (title) {
      case "":
      case "Notes":
        setSearchNotes(
          notes.filter((note: UserNote | UserNoteData) =>
            isUserNote(note)
              ? note.note.title.toLowerCase().includes(query)
              : note.note_data.title.toLowerCase().includes(query)
          )
        );
        break;

      case "Favorites":
        setSearchNotes(
          favoriteNotes.filter((note: UserNote | UserNoteData) =>
            isUserNote(note)
              ? note.note.title.toLowerCase().includes(query)
              : note.note_data.title.toLowerCase().includes(query)
          )
        );
        break;

      case "Archive":
        setSearchNotes(
          archiveNotes.filter((note: UserNote | UserNoteData) =>
            isUserNote(note)
              ? note.note.title.toLowerCase().includes(query)
              : note.note_data.title.toLowerCase().includes(query)
          )
        );
        break;

      case "Trash":
        setSearchNotes(
          trashNotes.filter((note: UserNote | UserNoteData) =>
            isUserNote(note)
              ? note.note.title.toLowerCase().includes(query)
              : note.note_data.title.toLowerCase().includes(query)
          )
        );
        break;

      default:
        setSearchNotes(
          tagNotes.filter((note: UserNote | UserNoteData) =>
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
        (note: UserNote | UserNoteData) =>
          note.tags.includes(tag.id) &&
          note.is_trashed === false &&
          note.is_archived === false
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
    console.log("this is the notes", notesArray);

    const { pinned, favorites, archived, trashed, filtered, other } =
      categorizedNotes(notesArray);
    setOtherNotes(other);
    setSearchNotes(filtered);
    console.log("this is the pinned notes", pinned);
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
    console.log("use note hook edit note triggered");
    const previousNotes = [...notes];
    const updatedNotes = notes.map((n) => (n.id === newNote.id ? newNote : n));
    refreshCategorizedNotes(updatedNotes);
    try {
      setLoading(true);
      setError(null);
      const response = await updateNote(newNote);
      if (!(response >= 200 && response < 300)) {
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
  return useContext(NoteContext);
};

export { NoteContext, NoteProvider };
export default useNote;
