import {createContext, useCallback, useContext, useEffect, useState} from "react";
import {createNote, deleteNote, getNotes, updateNote} from "../services/NoteService.jsx";

const NoteContext = createContext();

const NoteProvider = ({children}) => {
    const [notes, setNotes] = useState([]);
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [pinnedNotes, setPinnesdNotes] = useState([]);
    const [favoriteNotes, setFavoriteNotes] = useState([]);
    const [archiveNotes, setArchiveNotes] = useState([]);
    const [trashNotes, setTrashNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleSearch = (query) => {
        if (query.trim() === "") {
            setFilteredNotes(notes);
        } else {
            setFilteredNotes(
                notes.filter((note) =>
                    note.title.toLowerCase().includes(query.toLowerCase())
                )
            );
        }
    };
    const fetchNotes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedNotes = await getNotes();
            setNotes(fetchedNotes);
            setFilteredNotes(fetchedNotes);
            setPinnesdNotes(fetchedNotes.filter(note => note.is_pinned === true));
            setFavoriteNotes(fetchedNotes.filter(note => note.is_favorite === true));
            setArchiveNotes(fetchedNotes.filter(note => note.is_archived === true));
            setTrashNotes(fetchedNotes.filter(note => note.is_trashed === true));
        } catch (e) {
            setError(e || "");
        } finally {
            setLoading(false);
        }
    }, []);

    const addNote = async (note) => {
        try {
            setLoading(true);
            setError(null);
            await createNote(note);
            fetchNotes();
        } catch (e) {
            setError(e || "");
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
                fetchNotes();
            } else {
                console.log("Failed to update note");
            }
        } catch (e) {
            setError(e || "");
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
                fetchNotes();
            } else {
                console.log("Failed to delete note");
            }
        } catch (e) {
            setError(e || "");
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
                notes,pinnedNotes,setPinnesdNotes,
                filteredNotes,
                favoriteNotes,
                archiveNotes,
                trashNotes,
                selectedNote,
                setSelectedNote,
                isLoading,
                error,
                fetchNotes,
                handleSearch,
                addNote,
                editNote,
                removeNote,
            }}
        >
            {children}
        </NoteContext.Provider>
    );
};

const useNote = () => {
    return useContext(NoteContext);
};

export {NoteContext, NoteProvider};
export default useNote;
