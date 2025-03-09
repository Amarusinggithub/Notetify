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

export const createTag = async (tagName) => {
  try {
    const csrfToken = await getCSRFToken();

    const response = await axios.post(
      "http://localhost:8000/api/tags/create_tag/",
      {
        name: tagName,
      },
      {
        withCredentials: true,
        headers: { "X-CSRFToken": csrfToken },
        "Content-Type": "application/json",
      }
    );
    console.log(response.data);
    return response.status;
  } catch (e) {
    console.error(e);
    return {
      success: false,
      error:
        e.response?.data?.error || "An error occurred while creating the tag",
    };
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
          "Content-Type": "application/json",
        },
      }
    );

    console.log(response.data);
    return response.status;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error:
        error.response?.data?.error ||
        "An error occurred while updating the tag",
    };
  }
};

export const deleteTag = async (tag) => {
  try {
    const csrfToken = await getCSRFToken();
    const response = await axios.delete(
      `http://localhost:8000/api/tags/delete_tag/${tag.id}/`,

      {
        withCredentials: true,
        headers: {
          "X-CSRFToken": csrfToken,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.status);
    return response.status;
  } catch (e) {
    console.error(e);
    return {
      success: false,
      error:
        e.response?.data?.error || "An error occurred while deleting the tag",
    };
  }
};
