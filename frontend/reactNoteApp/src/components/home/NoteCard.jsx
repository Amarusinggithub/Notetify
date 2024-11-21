import "../../styles/NoteCard.css";
import {useContext, useEffect, useRef} from "react";
import {deleteNote} from "../../services/NoteService.jsx";
import NoteContext from "../../context/NoteContext.jsx";

const NoteCard = (note) => {

    const noteRef = useRef(null);
    const {selectedNote, setSelectedNote} = useContext(NoteContext);

    useEffect(() => {
        if (selectedNote && noteRef.current) {
            noteRef.current.focus();
        }
    }, [selectedNote]);

    const handleOnSelected = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setSelectedNote(true);
    }

    const handleNotSelected = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setSelectedNote(false);
    }

    const handleDeleteNote = async () => {
        try {
            const response = await deleteNote(note.note);
            if (response == 200) {
                console.log("note was deleted successfully");
                setSelectedNote(false);
            } else {
                console.log("note was not deleted successfully");
            }
        } catch (e) {
            console.error("There was a error deleting the note", e);
        }

    }

    useEffect(() => {
        console.log("this is the note: ", {note})

    }, [note.note]);


    return <>
        <div onClick={handleOnSelected}
             key={note.note.id}
             className={`note-card ${selectedNote ? "selected-note" : "note-card"}`}>


            <div ref={noteRef} contentEditable={selectedNote ? "true" : "false"}>
                <h2>{note.note.title}</h2>
                <p>{note.note.content}</p>
            </div>
            {selectedNote && (<div>
                <button onClick={handleDeleteNote} className={"delete-btn"} type={"submit"}>Delete</button>
                <button onClick={handleNotSelected} className={"close-btn"} type={"submit"}>Close</button>
            </div>)
            }
        </div>


    </>

}

export default NoteCard;