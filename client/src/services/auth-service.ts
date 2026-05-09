import axios from 'axios';
import api, { ensureCSRFToken } from '@/lib/api';
import type { SharedData, User } from '@/types';

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
	email: string;
};

interface TwoFactorRequired {
	requiresTwoFactor: true;
}

export function buildSharedData(apiResponse: any): SharedData {
    const user: User = {
        id: apiResponse.id,
        first_name: apiResponse.first_name,
        last_name: apiResponse.last_name,
        full_name: apiResponse.full_name,
        email: apiResponse.email,
        avatar: apiResponse.avatar,
        timezone: apiResponse.timezone,
        locale: apiResponse.locale,
        preferred_language: apiResponse.preferred_language,
        is_active: apiResponse.is_active,
        is_verified: apiResponse.is_verified,
        email_verified_at: apiResponse.email_verified_at,
        two_factor_confirmed_at: apiResponse.two_factor_confirmed_at,
        last_login_at: apiResponse.last_login_at,
        last_login_ip: apiResponse.last_login_ip,
        created_at: apiResponse.created_at,
        updated_at: apiResponse.updated_at,
        deleted_at: apiResponse.deleted_at,
        two_factor_recovery_codes: apiResponse.two_factor_recovery_codes,
        two_factor_secret: apiResponse.two_factor_secret,
    };
    return {
        auth: { user },
        name: user.full_name,
        sidebarOpen: false,
    } as SharedData;
}


export async function signUp(params: SignUpParams): Promise<SharedData> {
	await ensureCSRFToken();
	const response = await api.post('register', {
		first_name: params.first_name.trim(),
		last_name: params.last_name.trim(),
		email: params.email.trim().toLowerCase(),
		password: params.password,
		password_confirmation: params.password,
	});
	return buildSharedData(response.data);
}

export async function login(
	params: LoginParams
): Promise<SharedData | TwoFactorRequired> {
	await ensureCSRFToken();

	try {
		const response = await api.post('login', {
			email: params.email.trim().toLowerCase(),
			password: params.password,
			remember: params.remember,
		});

		if (response.data.two_factor === true) {
			return { requiresTwoFactor: true };
		}

		const userResponse = await api.get('user');
		return buildSharedData(userResponse.data);
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 423) {
			return { requiresTwoFactor: true };
		}
		throw error;
	}
}

export async function logout(): Promise<void> {
	await api.post('logout');
}

export async function confirmPassword(password: string): Promise<void> {
	await ensureCSRFToken();
	await api.post('user/confirm-password', { password });
}

export async function passwordReset(
	params: PasswordResetParams
): Promise<number> {
	await ensureCSRFToken();
	const response = await api.post('reset-password', {
		token: params.token,
		email: params.email,
		password: params.password,
		password_confirmation: params.password,
	});

	return response.status;
}

export async function forgotPassword(email: string): Promise<void> {
	await ensureCSRFToken();
	await api.post('forgot-password', {
		email: email.trim().toLowerCase(),
	});
}

export async function updatePassword(
	current: string,
	newPassword: string
): Promise<void> {
	await api.put('user/password', {
		current_password: current,
		password: newPassword,
		password_confirmation: newPassword,
	});
}

export async function getTwoFactorQrCode(): Promise<string> {
	const response = await api.get('user/two-factor-qr-code');
	return response.data.svg;
}

export async function updateProfile(params): Promise<void> {
	await api.put('user/profile-information', params);
}


export async function verifyEmail() {
	await ensureCSRFToken();
	 await api.post("email/verification-notification");
}

export async function getMe(): Promise<SharedData> {
	const response = await api.get('user');
	return buildSharedData(response.data);
}

export async function submitTwoFactorCode(code: string): Promise<SharedData> {
	await ensureCSRFToken();
	const response = await api.post('two-factor-challenge', { code });
	return buildSharedData(response.data);
}

export async function submitRecoveryCode(
	recoveryCode: string
): Promise<SharedData> {
	await ensureCSRFToken();
	const response = await api.post('two-factor-challenge', {
		recovery_code: recoveryCode,
	});
	return buildSharedData(response.data);
}

export async function getRecoveryCodes(): Promise<string[]> {
	const response = await api.get('user/two-factor-recovery-codes');
	return response.data;
}

export async function regenerateRecoveryCodes(): Promise<string[]> {
	await ensureCSRFToken();
	const response = await api.post('user/two-factor-recovery-codes');
	return response.data;
}
export async function enableTwoFactor(): Promise<number> {
	await ensureCSRFToken();
	const response = await api.post('user/two-factor-authentication');
	return response.status;
}

export async function disableTwoFactor(): Promise<number> {
	await ensureCSRFToken();
	const response = await api.delete('user/two-factor-authentication');
	return response.status;
}

export async function confirmTwoFactor(code: string): Promise<number> {
	await ensureCSRFToken();
	const response = await api.post('user/confirmed-two-factor-authentication', {
		code,
	});

	return response.status;
}
