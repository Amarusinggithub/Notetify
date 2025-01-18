import axios from "axios";
import {getCSRFToken} from "../../../services/CSRFTokenService.jsx";

axios.defaults.withCredentials = true;
export const getNotes = async () => {
    try {
        const csrfToken = await getCSRFToken();

        const response = await axios.get("http://localhost:8000/api/notes/",
            {

                withCredentials: true,
                headers: {"X-CSRFToken": csrfToken,},
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

        const response = await axios.post(
          "http://localhost:8000/api/notes/create_note",
          {
            title: note.title,
            content: note.content,
            is_favorite: note.is_favorite,
            is_pinned: note.is_pinned,
            is_trashed: note.is_trashed,
            is_archived: note.is_archived,
        
          },
          {
            withCredentials: true,
            headers: { "X-CSRFToken": csrfToken },
          }
        );
        console.log(response.data);
        return response.status;
    } catch (e) {
        console.error(e)
    }

}

export const updateNote = async (note) => {
    try {
        const csrfToken = await getCSRFToken();

        const response = await axios.put(
          `http://localhost:8000/api/notes/edit_note/${note.id}/`,
          {
            id: note.id,
            title: note.title,
            content: note.content,
            is_favorite: note.is_favorite,
            is_pinned: note.is_pinned,
            is_trashed: note.is_trashed,
            is_archived: note.is_archived,
            user: note.user,
          },
          {
            withCredentials: true,
            headers: {
              "X-CSRFToken": csrfToken,
            },
          }
        );

        console.log(response.data);
        return response.status;
    } catch (error) {
        console.error(error);
        throw error;
    }
};


export const deleteNote = async (note) => {
    try {
        const csrfToken = await getCSRFToken();
        const response = await axios.delete(
            `http://localhost:8000/api/notes/delete_note/${note.id}/`,

            {
                withCredentials: true,
                headers: {"X-CSRFToken": csrfToken,},
            }
        );
        console.log(response.status);
        return response.status;
    } catch (e) {
        console.error(e)
    }

}


