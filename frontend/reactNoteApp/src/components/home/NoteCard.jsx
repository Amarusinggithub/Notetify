import "../../styles/NoteCard.css";
import {useContext, useEffect, useRef, useState} from "react";
import {deleteNote, updateNote} from "../../services/NoteService.jsx";
import NoteContext from "../../context/NoteContext.jsx";

const NoteCard = ({note}) => {
    const noteRef = useRef(null);
    const {selectedNote, setSelectedNote} = useContext(NoteContext);
    const isSelected = selectedNote && selectedNote.id === note.id;
    const [noteState, setNoteState] = useState({
        title: note.title,
        content: note.content,
        id: note.id,
        is_favorite: note.is_favorite,
        is_pinned: note.is_pinned,
        in_recycleBin: note.in_recycleBin,
        date_created: note.date_created,
        last_updated: note.last_updated
    });
    const [isEdited, setIsEdited] = useState(false);
    useEffect(() => {
        if (isSelected && noteRef.current) {
            noteRef.current.focus();
        }
    }, [isSelected]);

    const handleSelect = async (event) => {
        event.preventDefault();

        if (isSelected && isEdited) {
            try {
                const response = await updateNote(noteState);
                if (response === 200) {

                    console.log("Note was updated successfully");
                    setIsEdited(false)
                } else {
                    console.log("Note was not updated successfully");
                }
            } catch (error) {
                console.error("There was an error updating the note", error);
            }
    }
        setSelectedNote(isSelected ? null : note);
    };

    const handleInput = (e) => {
        setNoteState({...noteState, [e.target.name]: e.target.value});
        setIsEdited(true);
    };

    const handleDeleteNote = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const response = await deleteNote(note);
            if (response === 200) {
                console.log("Note was deleted successfully");
                setSelectedNote(null);
            } else {
                console.log("Note was not deleted successfully");
            }
        } catch (error) {
            console.error("There was an error deleting the note", error);
        }
    };

    return (
        <div
            className={`${isSelected ? "notecard-bg" : ""}`}
            onClick={(e) => handleSelect(e)}
        >
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    if (!isSelected) {
                        handleSelect(e);
                    }
                }}
                className={`note-card ${isSelected ? "selected-note" : ""}`}
            >
                <div ref={noteRef} contentEditable={isSelected ? "true" : "false"} className={"note"}>
                    <div className={"note-title"}>
                        <h2 onChange={handleInput} name={"title"}>
                            {noteState.title}
                        </h2>
                    </div>
                    <div className={"note-content"}>
                        <p onChange={handleInput} name={"content"}>
                            {noteState.content}
                        </p>
                    </div>
                </div>
                {isSelected && (
                    <div className={"function-bar"}>
                        <button
                            onClick={handleDeleteNote}
                            className="delete-btn"
                            type="button"
                        >
                            Delete
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(e);
                            }}
                            className="close-btn"
                            type="button"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoteCard;
