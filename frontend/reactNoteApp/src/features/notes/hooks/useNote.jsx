import {
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
} from "../services/NoteService.jsx";

const NoteContext = createContext();

const categorizedNotes = (notesArray) => {
  const pinned = [];
  const favorites = [];
  const archived = [];
  const trashed = [];
  const filtered = [];
  const other = [];

  notesArray.forEach((note) => {
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

const NoteProvider = ({ children }) => {
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [otherNotes, setOtherNotes] = useState([]);
  const [tagNotes, setTagNotes] = useState([]);
  const [notes, setNotes] = useState([]);
  const [searchNotes, setSearchNotes] = useState([]);
  const [pinnedNotes, setPinnedNotes] = useState([]);
  const [favoriteNotes, setFavoriteNotes] = useState([]);
  const [archiveNotes, setArchiveNotes] = useState([]);
  const [trashNotes, setTrashNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = () => {
    const query = search.trim().toLowerCase();

    if (query === "") {
      setSearchNotes([]);
      return;
    }

    switch (title) {
      case "Notes":
        setSearchNotes(
          notes.filter(
            (note) =>
              note.title.toLowerCase().includes(query) &&
              !note.is_trashed &&
              !note.is_archived
          )
        );
        break;

      case "Favorites":
        setSearchNotes(
          favoriteNotes.filter(
            (note) =>
              note.title.toLowerCase().includes(query) &&
              !note.is_trashed &&
              !note.is_archived
          )
        );
        break;

      case "Archive":
        setSearchNotes(
          archiveNotes.filter(
            (note) =>
              note.title.toLowerCase().includes(query) && !note.is_trashed
          )
        );
        break;

      case "Trash":
        setSearchNotes(
          trashNotes.filter((note) => note.title.toLowerCase().includes(query))
        );
        break;

      default:
        setSearchNotes(
          tagNotes.filter(
            (note) =>
              note.title.toLowerCase().includes(query) &&
              !note.is_trashed &&
              !note.is_archived
          )
        );
        break;
    }
  };

  const handleTagClick = (tag) => {
    setTagNotes(
      notes.filter(
        (note) =>
          note.tags.includes(tag.id) &&
          note.is_trashed === false &&
          note.is_archived === false
      )
    );
  };

  const handleFavorite = (note) => {
    const updatedNote = { ...note, is_favorited: !note.is_favorited };
    editNote(updatedNote);
  };

  const handleTrash = (note) => {
    const updatedNote = { ...note, is_trashed: !note.is_trashed };
    editNote(updatedNote);
  };

  const handleArchive = (note) => {
    const updatedNote = { ...note, is_archived: !note.is_archived };
    editNote(updatedNote);
  };

  const handlePin = (note) => {
    const updatedNote = { ...note, is_pinned: !note.is_pinned };
    editNote(updatedNote);
  };

  const refreshCategorizedNotes = (notesArray) => {
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
    } catch (e) {
      setError(e.message || "Error fetching notes");
    } finally {
      setLoading(false);
    }
  }, []);

  const addNote = async (note) => {
    const previousNotes = [...notes];

    refreshCategorizedNotes([...notes, note]);

    try {
      setLoading(true);
      setError(null);

      const response = await createNote(note);
      if (!(response >= 200 && response < 300)) {
        throw new Error("Failed to add note on server");
      }
    } catch (e) {
      setError(e.message || "Error adding note");
      refreshCategorizedNotes(previousNotes);
    } finally {
      setLoading(false);
    }
  };

  const editNote = async (newNote) => {
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
    } catch (e) {
      setError(e.message || "Error updating note");
      refreshCategorizedNotes(previousNotes);
    } finally {
      setLoading(false);
    }
  };

  const removeNote = async (note) => {
    const previousNotes = [...notes];
    const updatedNotes = notes.filter((n) => n.id !== note.id);
    refreshCategorizedNotes(updatedNotes);

    try {
      setLoading(true);
      setError(null);

      const response = await deleteNote(note);
      if (!(response >= 200 && response < 300)) {
        throw new Error("Failed to remove note on server");
      }
    } catch (e) {
      setError(e.message || "Error deleting note");
      refreshCategorizedNotes(previousNotes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return (
    <NoteContext.Provider
      value={{
        search,
        title,
        notes,
        pinnedNotes,
        filteredNotes: searchNotes,
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
