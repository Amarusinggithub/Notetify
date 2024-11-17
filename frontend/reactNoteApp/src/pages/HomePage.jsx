import {Link, useNavigate} from "react-router-dom";
import {logout} from "../services/AuthService.jsx";
import Navbar from "../components/home/navbar.jsx";
import "../styles/Homepage.css";
import {getNotes} from "../services/NoteService.jsx";
import {useEffect, useState} from "react";
import NoteCard from "../components/home/NoteCard.jsx";

const Homepage = () => {
    let navigate = useNavigate();
    const [notes, setNotes] = useState([]);

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
            if (response === 200) {
                console.log("Logout successful");
                navigate("/LoginForm");
            } else {
                console.log("Logout failed");
            }
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <div className={"container"}>
            <Navbar text={"Notetify"}/>
            <div className={"notes"}>
                {notes &&
                    notes.map((note) => (
                        <div key={note.id}>
                            <NoteCard note={note}/>
                        </div>
                    ))}
            </div>
            <div>
                <Link to="/SignUpForm">Sign Up</Link>
                <br/>
                <Link to="/LoginForm">Login</Link>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
};

export default Homepage;
