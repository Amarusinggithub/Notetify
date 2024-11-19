import "../../styles/NoteCard.css";
import {useEffect, useRef, useState} from "react";
import {deleteNote} from "../../services/NoteService.jsx";

const NoteCard = (note) => {
    const [selected, setSelected] = useState(false);
    const noteRef = useRef(null);

    useEffect(() => {
        if (selected && noteRef.current) {
            noteRef.current.focus();
        }
    }, [selected]);

    const handleOnSelected = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setSelected(true);
    }

    const handleNotSelected = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setSelected(false);
    }

    const handleDeleteNote = async () => {
        try {
            const response = await deleteNote(note.note);
            if (response == 200) {
                console.log("note was deleted successfully");
                setSelected(false);
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
             className={`note-card ${selected ? "selected-note" : "note-card"}`}>


            <div ref={noteRef} contentEditable={selected ? "true" : "false"}>
                <h2>{note.note.title}</h2>
                <p>{note.note.content}</p>
            </div>
            {selected && (<div>
                <button onClick={handleDeleteNote} className={"delete-btn"} type={"submit"}>Delete</button>
                <button onClick={handleNotSelected} className={"close-btn"} type={"submit"}>Close</button>
            </div>)
            }
        </div>


    </>

}

export default NoteCard;