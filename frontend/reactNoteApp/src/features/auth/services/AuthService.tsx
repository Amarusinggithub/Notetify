import axios from "axios";
import { getCSRFToken } from "../../../services/CSRFTokenService.tsx";

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
        console.log("removed tokens");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error); // For all other errors, return the error as is.
  }
);

export const login = async (username, password) => {
  try {
    const response = await axiosInstance.post("login/", { username, password });
    localStorage.clear();
    localStorage.setItem("access_token", response.data.access_token);
    localStorage.setItem("refresh_token", response.data.refresh_token);
    axiosInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${response.data["access_token"]}`;
    console.log(
      `this is the access token:${response.data.access_token} and refresh token: ${response.data.refresh_token}`
    );
    return response;
  } catch (error) {
    console.error(
      "Login error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const signUp = async (email, username, password) => {
  try {
    const response = await axiosInstance.post("register/", {
      email,
      username,
      password,
    });
    localStorage.clear();
    localStorage.setItem("access_token", response.data.access_token);
    localStorage.setItem("refresh_token", response.data.refresh_token);
    axiosInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${response.data["access"]}`;

    console.log(response.data);
    return response;
  } catch (error) {
    console.error(
      "Signup error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await axiosInstance.post("logout/");
    localStorage.clear();

    return response;
  } catch (e) {
    console.error(e);
  }
};
