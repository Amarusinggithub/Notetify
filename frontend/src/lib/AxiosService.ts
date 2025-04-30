import axios from "axios";
import Cookies from "js-cookie";

let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (e?: unknown) => void;
}[] = [];

const axiosInstance = axios.create({
  baseURL: `http://localhost:8000/`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

const processQueue = (error: any) => {
  failedQueue.forEach((prom: any) => {
    error ? prom.reject(error) : prom.resolve();
  });
  failedQueue = [];
};

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
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        await axiosInstance.post("token/refresh/");
        processQueue(null);

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        console.warn("Session expired. Redirecting to login...");

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export async function ensureCSRFToken() {
  let csrfToken: any = Cookies.get("csrftoken");
  if (!csrfToken) {
    await axiosInstance.get(`csrf/`);
  }
}

export default axiosInstance;
