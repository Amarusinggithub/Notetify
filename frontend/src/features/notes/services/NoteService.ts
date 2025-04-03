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

// Response interceptor to handle token refresh on 401 errors.
axiosInstance.interceptors.response.use(
  (response) => response, // Return response directly if successful.
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      error.response?.data?.code === "token_not_valid" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          return Promise.reject(error);
        }
        // Attempt to refresh the token.
        const refreshResponse = await axios.post(
          "http://localhost:8000/token/refresh/",
          { refresh: refreshToken }
        );
        const { access, refresh } = refreshResponse.data;
        // Store the new tokens.
        if (access) {
          localStorage.setItem("access_token", access);
        }
        if (refresh) {
          localStorage.setItem("refresh_token", refresh);
        } // Update the default Authorization header.
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access}`;
        originalRequest.headers["Authorization"] = `Bearer ${access}`;
        // Retry the original request with the new access token.
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // On failure, remove tokens and reject the error.
        // Optionally alert the user here
        console.warn("Session expired. Redirecting to login...");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        console.error("Token refresh failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
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
