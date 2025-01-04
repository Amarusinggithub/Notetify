import {useNavigate} from "react-router-dom";
import Navbar from "../../../components/navbar.jsx";
import "../styles/Notespage.css";
import {useContext, useState} from "react";
import NoteCard from "../components/NoteCard.jsx";
import UserContext from "../../../context/UserContext.jsx";
import NoteContext from "../contexts/NoteContext.jsx";
import SideNav from "../../../components/sidebar.jsx";
import useNote from "../hooks/useNote.jsx";

const NotesPage = () => {
    let navigate = useNavigate();
    const {
        selectedNote,
        setSelectedNote,
        notes,
        isLoading,
        error,
        fetchNotes,
        addNote,
        editNote,
        removeNote
    } = useNote();
    const {userData, setLogout} = useContext(UserContext);
    const [isSideNavOpen, setSideNavState] = useState(true);


    return (
        <NoteContext.Provider value={{selectedNote, setSelectedNote, isSideNavOpen, setSideNavState}}>
            <>
                <Navbar/>
                <div className={"container"}>


                    <div
                        className="child-container"
                        style={{
                            marginLeft: isSideNavOpen ? "250px" : "50px",
                            width: isSideNavOpen ? "calc(100% - 250px)" : "calc(100% - 50px)",
                        }}
                    >
                        <SideNav/>
                        <div className="notes">
                            {notes &&
                                notes.map((note) => (
                                    <div key={note.id} className="note-div">
                                        <NoteCard note={note}/>
                                    </div>
                                ))}
                        </div>
                    </div>


                </div>
            </>


        </NoteContext.Provider>

    );
};

export default NotesPage;
