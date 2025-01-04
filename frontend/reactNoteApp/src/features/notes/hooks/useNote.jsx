import {useCallback, useEffect, useState} from "react";
import {createNote, getNotes} from "../services/NoteService.jsx";

const useNote = () => {
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
    }


    const editNote = async (note) => {
        try {
            setLoading(true);
            setError(null);
            await updateNote(note);

        } catch (e) {
            setError(e || "");
        } finally {
            setLoading(false);
        }
    }

    const removeNote = async (note) => {
        try {
            setLoading(true);
            setError(null);
            await deleteNote(note);

        } catch (e) {
            setError(e || "");
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    return {selectedNote, setSelectedNote, notes, isLoading, error, fetchNotes, addNote, editNote, removeNote};
};

export default useNote;
