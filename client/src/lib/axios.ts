import axios from 'axios';
import Cookies from 'js-cookie';
import { CSRF_TOKEN_COOKIE_NAME } from '../types';

/*let isRefreshing = false;
let failedQueue: {
	resolve: (value: unknown) => void;
	reject: (e?: unknown) => void;
}[] = [];

const processQueue = (error?: any) => {
	failedQueue.forEach((prom: any) => {
		error ? prom.reject(error) : prom.resolve();
	});
	failedQueue = [];
};*/

const axiosInstance = axios.create({
	baseURL: `${import.meta.env.VITE_BASE_URL}`,
	headers: {
		'Content-Type': 'application/json',
		'X-Requested-With': 'XMLHttpRequest',
		Accept: 'application/json',
	},
	withCredentials: true,
	withXSRFToken: true,
});

axiosInstance.interceptors.request.use(
	(config) => {
		if (
			config.method &&
			!['get', 'head', 'options'].includes(config.method.toLowerCase())
		) {
			const csrfToken = Cookies.get(CSRF_TOKEN_COOKIE_NAME);
			if (csrfToken) {
				config.headers['X-XSRF-TOKEN'] = csrfToken;
			}
		}

		console.log('Request config:', {
			url: config.url,
			method: config.method,
			withCredentials: config.withCredentials,
			headers: config.headers
		});

		return config;
	},
	(error) => Promise.reject(error),
);

/*// Response interceptor to handle token refresh on 401 errors.
axiosInstance.interceptors.response.use(
	(response) => {
		console.log('Response received:', {
			url: response.config.url,
			status: response.status,
			headers: response.headers
		});
		return response;
	},
	async (error) => {
		const originalRequest = error.config;

		console.log('Response error:', {
			url: originalRequest?.url,
			status: error.response?.status,
			data: error.response?.data
		});

		const skipRetryUrls = [
			'token/refresh',
			'auth/me',
			'csrf/',
			'login/',
			'register/'
		];

		if (skipRetryUrls.some(url => originalRequest?.url?.includes(url))) {
			return Promise.reject(error);
		}

		if (
			error.response &&
			error.response.status === 401 &&
			!originalRequest._retry
		) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then(() => axiosInstance(originalRequest))
					.catch((err) => Promise.reject(err));
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				await ensureCSRFToken();
				const refreshResponse = await axiosInstance.post('token/refresh/');
				console.log('Token refresh successful:', refreshResponse.status);

				processQueue();
				return axiosInstance(originalRequest);
			} catch (refreshError) {
				console.log('Token refresh failed:', refreshError);
				processQueue(refreshError);
				window.location.href = '/login';
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}
		return Promise.reject(error);
	},
);*/

export async function ensureCSRFToken() {
	const csrfToken = Cookies.get(CSRF_TOKEN_COOKIE_NAME);
	if (!csrfToken) {
		try {
			console.log('Fetching CSRF token...');
			await axiosInstance.get('/sanctum/csrf-cookie/');
			console.log('CSRF token fetched successfully');
		} catch (error) {
			console.error('Failed to get CSRF token:', error);
		}
	}
}

export default axiosInstance;
