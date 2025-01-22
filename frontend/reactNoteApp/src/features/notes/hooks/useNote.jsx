import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  createNote,
  createTag,
  deleteNote,
  deleteTag,
  getNotes,
  getTags,
  updateNote,
  updateTag,
} from "../services/NoteService.jsx";

const NoteContext = createContext();

const categorizedNotes = (notesArray) => {
  const pinned = [];
  const favorites = [];
  const archived = [];
  const trashed = [];
  const filtered = [];

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
    }
  });

  return { pinned, favorites, archived, trashed, filtered };
};

const NoteProvider = ({ children }) => {
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [pinnedNotes, setPinnedNotes] = useState([]);
  const [favoriteNotes, setFavoriteNotes] = useState([]);
  const [archiveNotes, setArchiveNotes] = useState([]);
  const [trashNotes, setTrashNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = () => {
    if (search.trim() === "") {
      setFilteredNotes(notes);
    } else {
      setFilteredNotes(
        notes.filter(
          (note) =>
            note.title.toLowerCase().includes(search.toLowerCase()) &&
            note.is_trashed === false &&
            note.is_archived === false
        )
      );
    }
  };

  const handleTagClick = (tag) => {
    setFilteredNotes(
      notes.filter(
        (note) =>
          note.tags.includes(tag) &&
          note.is_trashed === false &&
          note.is_archived === false
      )
    );
  };

  const handleFavorite = (note) => {
    note.is_favorited = !note.is_favorited;
    editNote(note);
  };

  const handleTrash = (note) => {
    note.is_trashed = !note.is_trashed;
    editNote(note);
  };

  const handleArchive = (note) => {
    note.is_archived = !note.is_archived;
    editNote(note);
  };

  const handlePin = (note) => {
    note.is_pinned = !note.is_pinned;
    editNote(note);
  };

  const refreshCategorizedNotes = (notesArray) => {
    setNotes(notesArray);

    const { pinned, favorites, archived, trashed, filtered } =
      categorizedNotes(notesArray);
    setFilteredNotes(filtered);
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
    try {
      setLoading(true);
      setError(null);

      await createNote(note);
    } catch (e) {
      setError(e.message || "Error adding note");
      fetchNotes();
    } finally {
      setLoading(false);
    }
  };

  const editNote = async (note) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateNote(note);
      if (response >= 200 && response < 300) {
        console.log("Note updated successfully");
      } else {
        console.log("Failed to update note");
      }
    } catch (e) {
      setError(e.message || "Error updating note");
      fetchNotes();
    } finally {
      setLoading(false);
    }
  };

  const removeNote = async (note) => {
    try {
      setLoading(true);
      setError(null);
      const response = await deleteNote(note);
      if (response >= 200 && response < 300) {
        console.log("Note deleted successfully");
        setSelectedNote(null);
      } else {
        console.log("Failed to delete note");
      }
    } catch (e) {
      setError(e.message || "Error deleting note");
      fetchNotes();
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTags = await getTags();
      setTags(fetchedTags);
    } catch (e) {
      setError(e.message || "Error fetching tags");
    } finally {
      setLoading(false);
    }
  }, []);

  const makeTag = async (tag) => {
    try {
      setLoading(true);
      setError(null);
      await createTag(tag);
    } catch (e) {
      setError(e.message || "Error adding tag");
      fetchTags();
    } finally {
      setLoading(false);
    }
  };

  const editTag = async (tag) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateTag(tag);
      if (response >= 200 && response < 300) {
        console.log("Tag updated successfully");
      } else {
        console.log("Failed to update tag");
      }
    } catch (e) {
      setError(e.message || "Error updating tag");
      fetchTags();
    } finally {
      setLoading(false);
    }
  };

  const removeTag = async (tag) => {
    try {
      setLoading(true);
      setError(null);
      const response = await deleteTag(tag);
      if (response >= 200 && response < 300) {
        console.log("Tag deleted successfully");
      } else {
        console.log("Failed to delete tag");
      }
    } catch (e) {
      setError(e.message || "Error deleting tag");
      fetchTags();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
    fetchNotes();
  }, [fetchTags, fetchNotes]);

  return (
    <NoteContext.Provider
      value={{
        search,
        notes,
        pinnedNotes,
        filteredNotes,
        favoriteNotes,
        archiveNotes,
        trashNotes,
        selectedNote,
        isLoading,
        error,
        tags,
        setTags,
        fetchTags,
        makeTag,
        editTag,
        removeTag,
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
