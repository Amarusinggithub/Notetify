import {useNavigate} from "react-router-dom";
import useNote from "../hooks/useNote.jsx";
import NoteCard from "../components/NoteCard.jsx";

const TrashPage = () => {
    let navigate = useNavigate();
    const {

        trashNotes,
        isLoading,
        error,
        fetchNotes,

    } = useNote();

    return (

        <div className="container">
            <div className="notes">
                {trashNotes &&
                    trashNotes.map((note) => (
                        <div key={note.id} className="note-div">
                            <NoteCard note={note}/>
                        </div>
                    ))}
            </div>
        </div>

    );
}
export default TrashPage;