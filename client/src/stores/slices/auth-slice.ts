import type { StoreState } from 'stores';
import { type StateCreator } from 'zustand';
import axiosInstance, { ensureCSRFToken } from '../../lib/axios';
import type { SharedData, User } from '../../types';
import { USERDATA_STORAGE_KEY } from '../../types';
import type { FormErrors } from '../../utils/helpers';
import { mapAxiosErrorToFieldErrors } from '../../utils/helpers';

type LoginParams = { email: string; password: string; remember?: boolean };

type AuthSliceState = {
	isLoading: boolean;
	isAuthenticated: boolean;
	checkingAuth: boolean;
	errors: FormErrors | null;
	sharedData: SharedData | null;
	url: string;
};

export type AuthSliceActions = {
	setErrors: (e: FormErrors | null) => void;
	setSharedData: (s: SharedData | null) => void;
	clearErrors: () => void;

	SignUp: (
		first_name: string,
		last_name: string,
		email: string,
		password: string,
	) => Promise<boolean>;
	Login: (params: LoginParams) => Promise<boolean>;
	Logout: () => Promise<void>;
	PasswordReset: (
		token: string | undefined,
		password: string,
	) => Promise<boolean>;
	ForgotPassword: (email: string) => Promise<string | null>;
	VerifyEmail: (email: string) => Promise<string | null>;
	ConfirmPassword: (password: string) => Promise<boolean>;
	confirmAuth: () => Promise<void>;
	setUrl: (url: string) => void;
};

export type AuthSlice = AuthSliceState & AuthSliceActions;

function buildShared(apiResponse: any): SharedData {
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

export const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (
	set,
	get,
) => ({
	isLoading: false,
	isAuthenticated: false,
	checkingAuth: true,
	errors: null,
	sharedData: null,
	url: '',
	setUrl: (url) => set({ url }),
	setErrors: (e) => set({ errors: e }),
	clearErrors: () => set({ errors: null }),
	setSharedData: (s) => set({ sharedData: s }),

	async SignUp(first_name, last_name, email, password) {
		set({ isLoading: true, errors: null });
		try {
			const fieldErrors: FormErrors = {};
			if (!first_name?.trim())
				fieldErrors.first_name = ['First name is required.'];
			if (!last_name?.trim())
				fieldErrors.last_name = ['Last name is required.'];
			if (!email?.trim()) fieldErrors.email = ['Email is required.'];
			if (!password?.trim()) fieldErrors.password = ['Password is required.'];
			if (password && password.length > 0 && password.length < 8)
				fieldErrors.password = ['Password must be at least 8 characters long.'];
			if (Object.keys(fieldErrors).length) {
				set({ errors: fieldErrors });
				return false;
			}

			await ensureCSRFToken();
			const response = await axiosInstance.post('auth/register/', {
				first_name: first_name.trim(),
				last_name: last_name.trim(),
				email: email.trim().toLowerCase(),
				password,
			});
			if (response.status >= 200 && response.status < 300) {
				const shared = buildShared(response.data);
				set({ isAuthenticated: true, sharedData: shared });
				localStorage.setItem(USERDATA_STORAGE_KEY, JSON.stringify(shared));
				return true;
			}
			set({
				errors: { general: ['Registration failed. Please try again.'] },
			});
			return false;
		} catch (error: any) {
			set({ errors: mapAxiosErrorToFieldErrors(error) });
			return false;
		} finally {
			set({ isLoading: false });
		}
	},

	async Login({ email, password, remember }) {
		set({ isLoading: true, errors: null });
		try {
			const fe: FormErrors = {};
			if (!email?.trim()) fe.email = ['Email is required.'];
			if (!password?.trim()) fe.password = ['Password is required.'];
			if (Object.keys(fe).length) {
				set({ errors: fe });
				return false;
			}
			await ensureCSRFToken();
			const response = await axiosInstance.post('auth/login/', {
				email: email.trim().toLowerCase(),
				password,
				remember,
			});
			if (response.status >= 200 && response.status < 300) {
				const shared = buildShared(response.data);
				set({ isAuthenticated: true, sharedData: shared });
				localStorage.setItem(USERDATA_STORAGE_KEY, JSON.stringify(shared));
				return true;
			}
			set({ errors: { password: ['Login failed. Please try again.'] } });
			return false;
		} catch (error: any) {
			set({ errors: mapAxiosErrorToFieldErrors(error) });
			return false;
		} finally {
			set({ isLoading: false });
		}
	},

	async ConfirmPassword(password) {
		set({ isLoading: true, errors: null });
		try {
			if (!password?.trim()) {
				set({ errors: { password: ['Password is required.'] } });
				return false;
			}
			await ensureCSRFToken();
			const response = await axiosInstance.post('auth/confirm-password/', {
				password,
			});
			if (response.status >= 200 && response.status < 300) return true;
			set({ errors: { password: ['Password confirmation failed.'] } });
			return false;
		} catch (error: any) {
			set({ errors: mapAxiosErrorToFieldErrors(error) });
			return false;
		} finally {
			set({ isLoading: false });
		}
	},

	async PasswordReset(token, password) {
		set({ isLoading: true, errors: null });
		try {
			if (!token || !password?.trim()) {
				set({ errors: { password: ['Invalid reset token or password.'] } });
				return false;
			}
			if (password.length < 8) {
				set({
					errors: {
						password: ['Password must be at least 8 characters long.'],
					},
				});
				return false;
			}
			await ensureCSRFToken();
			const response = await axiosInstance.post(
				'auth/password-reset/confirm/',
				{ password, token },
			);
			return response.status >= 200 && response.status < 300;
		} catch (error: any) {
			set({ errors: mapAxiosErrorToFieldErrors(error) });
			return false;
		} finally {
			set({ isLoading: false });
		}
	},

	async ForgotPassword(email) {
		set({ isLoading: true, errors: null });
		try {
			if (!email?.trim()) {
				set({ errors: { email: ['Email is required.'] } });
				return null;
			}
			await ensureCSRFToken();
			const response = await axiosInstance.post('auth/password-reset/', {
				email: email.trim().toLowerCase(),
			});
			if (response.status >= 200 && response.status < 300)
				return response.data.token || 'success';
			set({
				errors: {
					email: ['Failed to send reset email. Please try again.'],
				},
			});
			return null;
		} catch (error: any) {
			set({ errors: mapAxiosErrorToFieldErrors(error) });
			return null;
		} finally {
			set({ isLoading: false });
		}
	},

	async VerifyEmail(email) {
		set({ isLoading: true, errors: null });
		try {
			if (!email?.trim()) {
				set({ errors: { email: ['Email is required.'] } });
				return null;
			}
			await ensureCSRFToken();
			const response = await axiosInstance.post('auth/verify-email/', {
				email: email.trim().toLowerCase(),
			});
			if (response.status >= 200 && response.status < 300)
				return response.data.token || 'success';
			set({
				errors: {
					email: ['Failed to send verification email. Please try again.'],
				},
			});
			return null;
		} catch (error: any) {
			set({ errors: mapAxiosErrorToFieldErrors(error) });
			return null;
		} finally {
			set({ isLoading: false });
		}
	},

	async Logout() {
		set({ isLoading: true, errors: null });
		try {
			// Reset auth state and persisted values to defaults
			set({
				isAuthenticated: false,
				sharedData: null,
				selectedNoteId: null,
				selectedNotebookId: null,
				searchNotes: '',
				searchNotebooks: '',
			});
			localStorage.removeItem(USERDATA_STORAGE_KEY);

			try {
				await axiosInstance.post('auth/logout/');
			} catch (e) {
				// server logout may fail; local state already cleared
			}
		} finally {
			set({ isLoading: false });
		}
	},

	async confirmAuth() {
		try {
			await ensureCSRFToken();
			const response = await axiosInstance.get('auth/me/');
			if (response.status >= 200 && response.status < 300) {
				const shared = buildShared(response.data);
				set({ isAuthenticated: true, sharedData: shared });
				localStorage.setItem(USERDATA_STORAGE_KEY, JSON.stringify(shared));
			} else {
				set({ isAuthenticated: false, sharedData: null });
			}
		} catch (error: any) {
			if (error?.response?.status === 401 || error?.response?.status === 403) {
				set({ isAuthenticated: false, sharedData: null });
			}
		} finally {
			set({ checkingAuth: false });
		}
	},
});