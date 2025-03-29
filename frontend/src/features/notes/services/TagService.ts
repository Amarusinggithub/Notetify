import axios from "axios";

import { getCSRFToken } from "../../../services/CSRFTokenService.tsx";
import { Tag } from "types/types.ts";



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
