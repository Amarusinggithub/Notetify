import axios from "axios";
import { getCSRFToken } from "../services/CSRFTokenService";

const useAxios = () => {
  const axiosInstance = axios.create({
    baseURL: "http://localhost:8000/api/",
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  // Request interceptor to set CSRF token and Authorization header.
  axiosInstance.interceptors.request.use(
    async (request) => {
      if (!request.headers["X-CSRFToken"]) {
        try {
          const token = await getCSRFToken();
          request.headers["X-CSRFToken"] = token;
        } catch (err) {
          console.error("Failed to retrieve CSRF token:", err);
        }
      }
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
    (response) => response,
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
          const refreshResponse = await axios.post(
            "http://localhost:8000/token/refresh/",
            { refresh: refreshToken }
          );
          const { access, refresh } = refreshResponse.data;
          if (access) {
            localStorage.setItem("access_token", access);
          }
          if (refresh) {
            localStorage.setItem("refresh_token", refresh);
          }
          axiosInstance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${access}`;
          originalRequest.headers["Authorization"] = `Bearer ${access}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
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

  return axiosInstance;
};

export default useAxios;
