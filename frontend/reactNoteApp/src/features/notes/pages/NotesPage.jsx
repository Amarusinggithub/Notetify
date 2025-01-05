import {useNavigate} from "react-router-dom";
import "../styles/Notespage.css";
import NoteCard from "../components/NoteCard.jsx";
import useNote from "../hooks/useNote.jsx";

const NotesPage = () => {
    let navigate = useNavigate();
    const {

        notes,
        isLoading,
        error,
        fetchNotes,

    } = useNote();

    return (

        <div className="container">
            <div className="notes">
                {notes &&
                    notes.map((note) => (
                        <div key={note.id} className="note-div">
                            <NoteCard note={note}/>
                        </div>
                    ))}
            </div>
        </div>

    );
};

export default NotesPage;
