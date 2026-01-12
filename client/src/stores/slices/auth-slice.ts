import type { StoreState } from 'stores';
import { type StateCreator } from 'zustand';
import * as authService from '../../services/auth-service';
import type { SharedData } from '../../types';
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
		password: string
	) => Promise<boolean>;
	Login: (params: LoginParams) => Promise<boolean>;
	Logout: () => Promise<void>;
	PasswordReset: (
		token: string | undefined,
		password: string
	) => Promise<boolean>;
	ForgotPassword: (email: string) => Promise<string | null>;
	VerifyEmail: (email: string) => Promise<string | null>;
	ConfirmPassword: (password: string) => Promise<boolean>;
	confirmAuth: () => Promise<void>;
	setUrl: (url: string) => void;
};

export type AuthSlice = AuthSliceState & AuthSliceActions;

export const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (
	set,
	get
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

			const shared = await authService.signUp({
				first_name,
				last_name,
				email,
				password,
			});
			set({ isAuthenticated: true, sharedData: shared });
			return true;
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

			const shared = await authService.login({ email, password, remember });
			set({ isAuthenticated: true, sharedData: shared });
			return true;
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

			await authService.confirmPassword(password);
			return true;
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

			await authService.passwordReset({ token, password });
			return true;
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

			const token = await authService.forgotPassword(email);
			return token;
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

			const token = await authService.verifyEmail(email);
			return token;
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

			try {
				await authService.logout();
			} catch (e) {
				// server logout may fail; local state already cleared
			}
		} finally {
			set({ isLoading: false });
		}
	},

	async confirmAuth() {
		try {
			const shared = await authService.getMe();
			set({ isAuthenticated: true, sharedData: shared });
		} catch (error: any) {
			if (error?.response?.status === 401 || error?.response?.status === 403) {
				set({ isAuthenticated: false, sharedData: null });
			}
		} finally {
			set({ checkingAuth: false });
		}
	},
});
