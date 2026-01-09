import axiosInstance, { ensureCSRFToken } from '../lib/axios';
import type { SharedData, User } from '../types';

type LoginParams = { email: string; password: string; remember?: boolean };

type SignUpParams = {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
};

type PasswordResetParams = {
	token: string;
	password: string;
};

export function buildSharedData(apiResponse: any): SharedData {
	const user: User = {
		id: apiResponse.id,
		first_name: apiResponse.first_name,
		last_name: apiResponse.last_name,
		email: apiResponse.email,
		is_active: apiResponse.is_active,
	};
	return {
		auth: { user },
		name: `${user.first_name} ${user.last_name}`,
		sidebarOpen: false,
	} as SharedData;
}

export async function signUp(params: SignUpParams): Promise<SharedData> {
	await ensureCSRFToken();
	const response = await axiosInstance.post('auth/register/', {
		first_name: params.first_name.trim(),
		last_name: params.last_name.trim(),
		email: params.email.trim().toLowerCase(),
		password: params.password,
	});
	return buildSharedData(response.data);
}

export async function login(params: LoginParams): Promise<SharedData> {
	await ensureCSRFToken();
	const response = await axiosInstance.post('auth/login/', {
		email: params.email.trim().toLowerCase(),
		password: params.password,
		remember: params.remember,
	});
	return buildSharedData(response.data);
}

export async function logout(): Promise<void> {
	await axiosInstance.post('auth/logout/');
}

export async function confirmPassword(password: string): Promise<void> {
	await ensureCSRFToken();
	await axiosInstance.post('auth/confirm-password/', { password });
}

export async function passwordReset(params: PasswordResetParams): Promise<void> {
	await ensureCSRFToken();
	await axiosInstance.post('auth/password-reset/confirm/', {
		password: params.password,
		token: params.token,
	});
}

export async function forgotPassword(email: string): Promise<string> {
	await ensureCSRFToken();
	const response = await axiosInstance.post('auth/password-reset/', {
		email: email.trim().toLowerCase(),
	});
	return response.data.token || 'success';
}

export async function verifyEmail(email: string): Promise<string> {
	await ensureCSRFToken();
	const response = await axiosInstance.post('auth/verify-email/', {
		email: email.trim().toLowerCase(),
	});
	return response.data.token || 'success';
}

export async function getMe(): Promise<SharedData> {
	await ensureCSRFToken();
	const response = await axiosInstance.get('auth/me/');
	return buildSharedData(response.data);
}
