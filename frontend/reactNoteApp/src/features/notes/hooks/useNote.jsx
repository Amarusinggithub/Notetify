import {createContext, useCallback, useContext, useEffect, useState} from "react";
import {createNote, deleteNote, getNotes, updateNote} from "../services/NoteService.jsx";

const NoteContext = createContext();

const NoteProvider = ({children}) => {
    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNotes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            setNotes(await getNotes());
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
                notes,
                selectedNote,
                setSelectedNote,
                isLoading,
                error,
                fetchNotes,
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
