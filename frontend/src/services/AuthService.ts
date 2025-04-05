import axios from "axios";
import { getCSRFToken } from "./CSRFTokenService.ts";

// Create an Axios instance with defaults.
const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Ensure cookies are sent with requests.
});

// Request interceptor to set CSRF token and Authorization header.
axiosInstance.interceptors.request.use(
  async (request) => {
    // Dynamically set the CSRF token if it's not already set.
    if (!request.headers["X-CSRFToken"]) {
      try {
        const token = await getCSRFToken();
        request.headers["X-CSRFToken"] = token;
      } catch (err) {
        console.error("Failed to retrieve CSRF token:", err);
      }
    }
    // Set the Authorization header if an access token exists.
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      request.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return request;
  },
  (error) => Promise.reject(error)
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

export const login = async (username: string, password: string) => {
  try {
    const response = await axiosInstance.post("login/", { username, password });
    const { access_token, refresh_token } = response.data;
    // Store tokens specifically, without clearing unrelated data.
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    // Update Axios default headers.
    axiosInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${access_token}`;
    console.log("Login successful. Tokens stored.");
    return response;
  } catch (error: any) {
    console.error(
      "Login error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const signUp = async (
  email: string,
  username: string,
  password: string
) => {
  try {
    const response = await axiosInstance.post("register/", {
      email,
      username,
      password,
    });
    const { access_token, refresh_token } = response.data;
    // Store tokens consistently.
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    axiosInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${access_token}`;
    console.log("Signup successful. Tokens stored.");
    return response;
  } catch (error: any) {
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
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    console.log("Logout successful. Tokens removed.");
    return response;
  } catch (error: any) {
    console.error(
      "Logout error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export default axiosInstance;
