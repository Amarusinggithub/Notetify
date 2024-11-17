import "../../styles/NoteCard.css";
import {useEffect, useState} from "react";

const NoteCard = (note) => {
    const [selected, setSelected] = useState(false);

    const handleOnSelected = (event) => {
        event.preventDefault();
        setSelected(true);
    }

    useEffect(() => {
        console.log("this is the note: ", {note})

    }, [note.note]);

    return <div onClick={handleOnSelected} contentEditable={selected ? "true" : "false"} key={note.note.id}
                className="note-card">
        <h2>{note.note.title}</h2>
        <p>{note.note.content}</p>
    </div>

}

export default NoteCard;