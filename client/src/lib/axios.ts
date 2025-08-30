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
		const isWriteMethod =
			config.method &&
			!['get', 'head', 'options'].includes(config.method.toLowerCase());

		if (isWriteMethod) {
			await ensureCSRFToken();
		}

		console.log('Request config:', config);
		return config;
	},
	(error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
	(response) => {
		console.log('Response received:', response);
		return response;
	},
	(error) => {
		console.error('Response error:', error.toJSON());
		return Promise.reject(error);
	},
);

export async function ensureCSRFToken() {
	if (!Cookies.get(CSRF_TOKEN_COOKIE_NAME)) {
		try {
			console.log('Fetching CSRF token...');
			await axiosInstance.get('/sanctum/csrf-cookie');
			console.log('CSRF token fetched successfully');
		} catch (error) {
			console.error('Failed to get CSRF token:', error);
		}
	}
}

export default axiosInstance;
