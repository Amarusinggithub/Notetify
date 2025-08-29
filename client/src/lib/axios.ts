import axios from 'axios';
import Cookies from 'js-cookie';
import { CSRF_TOKEN_COOKIE_NAME } from '../types';

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
	async (config) => {
		if (
			config.method &&
			!['get', 'head', 'options'].includes(config.method.toLowerCase()) &&
			!config.url?.includes('/sanctum/csrf-cookie')
		) {
			await ensureCSRFToken();

			const csrfToken = Cookies.get(CSRF_TOKEN_COOKIE_NAME);
			if (csrfToken) {
				config.headers['X-XSRF-TOKEN'] = csrfToken;
			}
		}

		console.log('Request config:', {
			url: config.url,
			method: config.method,
			withCredentials: config.withCredentials,
			headers: config.headers,
		});

		return config;
	},
	(error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
	(response) => {
		console.log('Response received:', {
			url: response.config.url,
			status: response.status,
			headers: response.headers,
		});
        console.log(response);

		return response;
	},
	(error) => {
		console.error('Response error:', {
			url: error.config?.url,
			status: error.response?.status,
			data: error.response?.data,
			message: error.message,
		});
		return Promise.reject(error);
	},
);

export async function ensureCSRFToken() {
	const csrfToken = Cookies.get(CSRF_TOKEN_COOKIE_NAME);
	if (!csrfToken) {
		try {
			console.log('Fetching CSRF token...');
			await axiosInstance.get('/sanctum/csrf-cookie');
			console.log('CSRF token fetched successfully');
		} catch (error) {
			console.error('Failed to get CSRF token:', error);
			throw error;
		}
	}
}

export default axiosInstance;
