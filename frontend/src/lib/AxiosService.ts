import axios from 'axios';
import Cookies from 'js-cookie';
import { CSRF_TOKEN_COOKIE_NAME } from './../types/index.ts';

let isRefreshing = false;
let failedQueue: {
	resolve: (value: unknown) => void;
	reject: (e?: unknown) => void;
}[] = [];

const processQueue = (error?: any) => {
	failedQueue.forEach((prom: any) => {
		error ? prom.reject(error) : prom.resolve();
	});
	failedQueue = [];
};

const axiosInstance = axios.create({
	baseURL: `${import.meta.env.VITE_BASE_URL}`,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
	xsrfCookieName: CSRF_TOKEN_COOKIE_NAME,
	xsrfHeaderName: 'X-CSRFToken',
});

// Response interceptor to handle token refresh on 401 errors.
axiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (originalRequest.url?.includes('token/refresh')) {
			return Promise.reject(error);
		}
		if (error.response && error.response.status === 401 && !originalRequest._retry) {
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
				await axiosInstance.post('token/refresh/');
				processQueue();

				return axiosInstance(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError);
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}
		return Promise.reject(error);
	},
);

export async function ensureCSRFToken() {
	let csrfToken: any = Cookies.get(CSRF_TOKEN_COOKIE_NAME);
	if (!csrfToken) {
		await axiosInstance.get(`csrf/`);
	}
}

export default axiosInstance;
