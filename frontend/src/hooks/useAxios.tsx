import axios from "axios";
import { getCSRFToken } from "../services/CSRFTokenService";


const useAxios = () => {
const BASE_URL = import.meta.env.VITE_BASE_URL as string;
const NOTETIFY_APP_TOKEN_REFRESH_URL = import.meta.env
  .VITE_NOTETIFY_APP_TOKEN_REFRESH_URL as string;
  let isRefreshing = false;
  let failedQueue: any = [];

  const processQueue = (error: any, token = null) => {
    failedQueue.forEach((prom: any) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };
  const axiosInstance = axios.create({
    baseURL: `${BASE_URL}`,
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
        !originalRequest._retry
      ) {
        if (isRefreshing) {
          // If a refresh is already in progress, queue the request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;
        try {
          const refreshToken = localStorage.getItem("refresh_token");
          if (!refreshToken) {
            return Promise.reject(error);
          }
          const refreshResponse = await axios.post(
            `${NOTETIFY_APP_TOKEN_REFRESH_URL}`,
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

          processQueue(null, access);

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          console.warn("Session expired. Redirecting to login...");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default useAxios;
