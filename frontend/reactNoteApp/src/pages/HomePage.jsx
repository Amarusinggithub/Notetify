import {useNavigate} from "react-router-dom";
import {logout} from "../services/AuthService.jsx";
import Navbar from "../components/home/navbar.jsx";
import "../styles/Homepage.css";
import {getNotes} from "../services/NoteService.jsx";
import {useContext, useEffect, useState} from "react";
import NoteCard from "../components/home/NoteCard.jsx";
import UserContext from "../context/UserContext.jsx";
import NoteContext from "../context/NoteContext.jsx";

const Homepage = () => {
    let navigate = useNavigate();
    const [selectedNote, setSelectedNote] = useState(null);
    const [notes, setNotes] = useState([]);
    const {userData, setLogout} = useContext(UserContext);




    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const notesData = await getNotes();
                setNotes(notesData)
            } catch (e) {
                console.error("Error fetching notes:", e);
            }
        };

        fetchNotes();
    }, []);
    const handleLogout = async () => {
        try {
            const response = await logout();
            if (response.status === 200) {
                console.log("Logout successful");
                setLogout();
                navigate("/login");
            } else {
                console.log("Logout failed");
            }
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <NoteContext.Provider value={{selectedNote, setSelectedNote}}>
            <div className={"container"}>
                <Navbar text={"Notetify"}/>
                <div className={"notes"}>
                    {notes &&
                        notes.map((note) => (
                            <div key={note.id} className="note-div">
                                <NoteCard note={note}/>
                            </div>
                        ))}
                </div>

                <button onClick={handleLogout}>Logout</button>

            </div>
        </NoteContext.Provider>

    );
};

export default Homepage;
