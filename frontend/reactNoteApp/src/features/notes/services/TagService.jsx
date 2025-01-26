import axios from "axios";
import { getCSRFToken } from "../../../services/CSRFTokenService.jsx";

axios.defaults.withCredentials = true;


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
        users: tag.users,
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






