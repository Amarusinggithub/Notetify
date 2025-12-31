import axios from 'axios';
import Cookies from 'js-cookie';
import { CSRF_TOKEN_COOKIE_NAME } from '../types';

// Normalize base URL to ensure it targets the Laravel API prefix.
// If VITE_BASE_URL is "http://localhost:8000", we append "/api".
// If it's empty, default to "/api" (same-origin API).
const RAW_BASE =
	(import.meta as any).env?.VITE_BASE_URL?.toString()?.replace(/\/+$/, '') ||
	'';
const BASE_URL = RAW_BASE
	? RAW_BASE.endsWith('/api')
		? RAW_BASE
		: `${RAW_BASE}/api`
	: '/api';

export const API_BASE_URL = BASE_URL;

const axiosInstance = axios.create({
	baseURL: BASE_URL,
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

		return config;
	},
	(error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => Promise.reject(error),
);

export async function ensureCSRFToken() {
	if (!Cookies.get(CSRF_TOKEN_COOKIE_NAME)) {
		try {
			await axiosInstance.get('/sanctum/csrf-cookie');
		} catch (error) {
			console.error('Failed to get CSRF token:', error);
		}
	}
}

export default axiosInstance;
