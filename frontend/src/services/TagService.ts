import axios from "axios";

import { Tag } from "types/types.ts";
import { getCSRFToken } from "./CSRFTokenService.ts";

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

export const getTags = async () => {
  try {
    const response = await axiosInstance.get("tags/");
    console.log(response.data);
    return response.data;
  } catch (e) {
    console.error(e);
  }
};

export const createTag = async (tagName: string) => {
  try {
    const response = await axiosInstance.post("tags/create_tag/", {
      name: tagName,
    });
    console.log(response.data);
    return response.status;
  } catch (e) {
    console.error(e);
  }
};

export const updateTag = async (tag: Tag) => {
  try {
    const response = await axiosInstance.put(`tags/edit_tag/${tag.id}/`, {
      id: tag.id,
      name: tag.name,
      users: tag.users,
    });

    console.log(response.data);
    return response.status;
  } catch (error) {
    console.error(error);
  }
};

export const deleteTag = async (tag: Tag) => {
  try {
    const response = await axiosInstance.delete(`tags/delete_tag/${tag.id}/`);
    console.log(response.status);
    return response.status;
  } catch (e) {
    console.error(e);
  }
};
