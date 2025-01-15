import {useNavigate} from "react-router-dom";
import "../styles/Notespage.css";
import NoteCard from "../components/NoteCard.jsx";
import useNote from "../hooks/useNote.jsx";

const NotesPage = () => {
    let navigate = useNavigate();
    const {
        pinnedNotes,

        filteredNotes,
        isLoading,
        error,


    } = useNote();

    return (

        <div className="container">
            <div className="notes">
                {filteredNotes &&
                    filteredNotes.map((note) => (
                        <div key={note.id} className="note-div">
                            <NoteCard note={note}/>
                        </div>
                    ))}
            </div>
        </div>

    );
};

export default NotesPage;
