import axios from "axios";
import {getCSRFToken} from "./CSRFTokenService.jsx";


export const getNotes = async () => {
    try {
        const csrfToken = await getCSRFToken();
        const response = await axios.get("http://localhost:8000/api/notes/",
            {
                withCredentials: true,
                headers: {"X-CSRFToken": csrfToken},
            });
        console.log(response.data);
        return response.data;
    } catch (e) {
        console.error(e)
    }

}
export const createNote = async (note) => {
    try {
        const csrfToken = await getCSRFToken();
        const response = await axios.post("http://localhost:8000/api/notes/create_note", {note},
            {
                withCredentials: true,
                headers: {"X-CSRFToken": csrfToken}, // Include headers here
            });
        console.log(response.data);
        return response.status;
    } catch (e) {
        console.error(e)
    }

}

export const updateNote = async (note) => {
    try {
        const csrfToken = await getCSRFToken();
        const response = await axios.post("http://localhost:8000/api/notes/edit_note/${note.id}", {"note": note},
            {
                withCredentials: true,
                headers: {"X-CSRFToken": csrfToken},
            });
        console.log(response.data);
        return response.status;
    } catch (e) {
        console.error(e)
    }

}

export const deleteNote = async (note) => {
    try {
        const csrfToken = await getCSRFToken();
        const response = await axios.post("http://localhost:8000/api/notes/delete_note/${note.id}/", {"note": note},
            {
                withCredentials: true,
                headers: {"X-CSRFToken": csrfToken}, // Include headers here
            });
        console.log(response.status);
        return response.status;
    } catch (e) {
        console.error(e)
    }

}


