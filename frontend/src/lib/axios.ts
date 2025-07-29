import axios from 'axios';
import Cookies from 'js-cookie';
import { CSRF_TOKEN_COOKIE_NAME } from '../types';

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
});

axiosInstance.interceptors.request.use(
	(config) => {
		if (
			config.method &&
			!['get', 'head', 'options'].includes(config.method.toLowerCase())
		) {
			const csrfToken = Cookies.get(CSRF_TOKEN_COOKIE_NAME);
			if (csrfToken) {
				config.headers['X-CSRFToken'] = csrfToken;
			}
		}
		return config;
	},
	(error) => Promise.reject(error),
);

// Response interceptor to handle token refresh on 401 errors.
axiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (originalRequest.url?.includes('token/refresh')) {
			return Promise.reject(error);
		}

		if (originalRequest.url?.includes('auth/me')) {
			return Promise.reject(error);
		}

		if (originalRequest.url?.includes('csrf/')) {
			return Promise.reject(error);
		}

		if (originalRequest.url?.includes('login/')) {
			return Promise.reject(error);
		}

		if (originalRequest.url?.includes('register/')) {
			return Promise.reject(error);
		}

		if (originalRequest.url?.includes('token/refresh')) {
			return Promise.reject(error);
		}
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
				await ensureCSRFToken();

				await axiosInstance.post('token/refresh/');
				processQueue();

				return axiosInstance(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError);
				window.location.href = '/login';

				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}
		return Promise.reject(error);
	},
);

export async function ensureCSRFToken() {
	const csrfToken = Cookies.get(CSRF_TOKEN_COOKIE_NAME);
	if (!csrfToken) {
		try {
			await axiosInstance.get('csrf/');
		} catch (error) {
			console.error('Failed to get CSRF token:', error);
		}
	}
}

export default axiosInstance;
