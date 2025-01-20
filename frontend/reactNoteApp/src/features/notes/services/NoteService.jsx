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
          "http://localhost:8000/api/notes/create_note/",
          {
            title: note.title,
            content: note.content,
            is_favorited: note.is_favorited,
            is_pinned: note.is_pinned,
            is_trashed: note.is_trashed,
            tags: note.tags,
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
            is_favorited: note.is_favorited,
            is_pinned: note.is_pinned,
            is_trashed: note.is_trashed,
            is_archived: note.is_archived,
            tags: note.tags,
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


export const getTags = async () => {
  try {
    const csrfToken = await getCSRFToken();

    const response = await axios.get("http://localhost:8000/api/tags/", {
      withCredentials: true,
      headers: { "X-CSRFToken": csrfToken },
    });
    console.log(response.data);
    return response.data;
  } catch (e) {
    console.error(e);
  }
};

export const createTag = async (tag) => {
  try {
    const csrfToken = await getCSRFToken();

    const response = await axios.post(
      "http://localhost:8000/api/tags/create_tag/",
      {
        name: tag.name,
        color: tag.color,
      },
      {
        withCredentials: true,
        headers: { "X-CSRFToken": csrfToken },
      }
    );
    console.log(response.data);
    return response.status;
  } catch (e) {
    console.error(e);
  }
};

export const updateTag = async (tag) => {
  try {
    const csrfToken = await getCSRFToken();

    const response = await axios.put(
      `http://localhost:8000/api/tags/edit_tag/${tag.id}/`,
      {
        id: tag.id,
        name: tag.name,
        color: tag.color,
        user: tag.user,
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

export const deleteTag = async (tag) => {
  try {
    const csrfToken = await getCSRFToken();
    const response = await axios.delete(
      `http://localhost:8000/api/tags/delete_tag/${tag.id}/`,

      {
        withCredentials: true,
        headers: { "X-CSRFToken": csrfToken },
      }
    );
    console.log(response.status);
    return response.status;
  } catch (e) {
    console.error(e);
  }
};





