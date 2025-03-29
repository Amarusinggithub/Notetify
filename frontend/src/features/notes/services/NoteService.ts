import axios from "axios";
import { getCSRFToken } from "../../../services/CSRFTokenService.tsx";
import { UserNote, UserNoteData } from "types/types.ts";

const csrfToken = await getCSRFToken();


const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api/",
  headers: {
    "Content-Type": "application/json",
    "X-CSRFToken": csrfToken,
  },
});

axiosInstance.defaults.withCredentials = true;

axiosInstance.interceptors.request.use(
  (request) => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      request.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response, // Directly return successful responses.
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the request as retried to avoid infinite loops.
      try {
        const refreshToken = localStorage.getItem("refresh_token"); // Retrieve the stored refresh token.
        // Make a request to your auth server to refresh the token.
        const response = await axios.post(
          "http://localhost:8000/token/refresh/",
          {
            refreshToken,
          }
        );
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        // Store the new access and refresh tokens.
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", newRefreshToken);
        // Update the authorization header with the new access token.
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest); // Retry the original request with the new access token.
      } catch (refreshError) {
        // Handle refresh token errors by clearing stored tokens and redirecting to the login page.
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error); // For all other errors, return the error as is.
  }
);

export const getNotes = async () => {
  try {
    const response = await axiosInstance.get("notes/");
    console.log(response.data);
    return response.data;
  } catch (e) {
    console.error(e);
  }
};
export const createNote = async (note: UserNoteData) => {
  try {
    const response = await axiosInstance.post("notes/create_note/", {
      note_data: note.note_data,
      tags: note.tags,
      is_pinned: note.is_pinned,
      is_trashed: note.is_trashed,
      is_archived: note.is_archived,
      is_favorited: note.is_favorited,
    });
    console.log(response.data);
    return response.status;
  } catch (e) {
    console.error(e);
  }
};

export const updateNote = async (note: UserNote) => {
  console.log("this");
  try {
    const response = await axiosInstance.put(`notes/edit_note/${note.id}/`, {
      id: note.id,
      note: note.note.id,

      note_data: {
        title: note.note.title,
        content: note.note.content,
        users: note.note.users,
      },
      user: note.user,
      tags: note.tags,
      is_pinned: note.is_pinned,
      is_trashed: note.is_trashed,
      is_archived: note.is_archived,
      is_favorited: note.is_favorited,
    });

    console.log(response.data);
    return response.status;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteNote = async (note: UserNote) => {
  try {
    const response = await axiosInstance.delete(
      `notes/delete_note/${note.id}/`
    );
    console.log(response.status);
    return response.status;
  } catch (e) {
    console.error(e);
  }
};
