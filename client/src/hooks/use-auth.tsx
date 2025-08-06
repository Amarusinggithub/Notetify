import React, {
	createContext,
	type PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import axiosInstance, { ensureCSRFToken } from '../lib/axios.ts';
import { mapErrorToMessage } from '../utils/helpers.ts';
import { type SharedData, type User, USERDATA_STORAGE_KEY } from './../types';

type AuthProviderProps = PropsWithChildren;
interface AuthContextType {
	SignUp: (
		firstName: string,
		lastName: string,
		email: string,
		password: string,
	) => Promise<boolean>;
	Login: (email: string, password: string) => Promise<boolean>;
	Logout: () => Promise<void>;
	PasswordReset: (
		token: string | undefined,
		password: string,
	) => Promise<boolean>;
	ForgotPassword: (email: string) => Promise<string | null>;
	VerifyEmail: (email: string) => Promise<string | null>;
	ConfirmPassword: (password: string) => Promise<boolean>;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setErrors: React.Dispatch<React.SetStateAction<string[] | null>>;
	setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
	setSharedData: React.Dispatch<React.SetStateAction<SharedData | null>>;
	clearErrors: () => void;
	sharedData: SharedData | null;
	errors: string[] | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	checkingAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: AuthProviderProps) => {
	const [isLoading, setLoading] = useState<boolean>(false);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
	const [errors, setErrors] = useState<string[] | null>(null);
	const [sharedData, setSharedData] = useState<SharedData | null>(null);

	const clearErrors = () => setErrors(null);

	const setAuth = (apiResponse: any) => {
		try {
			const user: User = {
				id: apiResponse.id,
				first_name: apiResponse.first_name,
				last_name: apiResponse.last_name,
				email: apiResponse.email,
				is_active: apiResponse.is_active,
			};
			const shared: SharedData = {
				auth: { user },
				name: `${user.first_name} ${user.last_name}`,
				quote: { message: '', author: '' },
				sidebarOpen: false,
			};
			setIsAuthenticated(true);
			setSharedData(shared);
			localStorage.setItem(USERDATA_STORAGE_KEY, JSON.stringify(shared));
		} catch (error) {
			console.error('Error setting auth data:', error);
			setErrors(['Error processing authentication data.']);
		}
	};

	const setNotAuth = () => {
		setIsAuthenticated(false);
		setSharedData(null);
		localStorage.removeItem(USERDATA_STORAGE_KEY);
	};

	async function SignUp(
		firstName: string,
		lastName: string,
		email: string,
		password: string,
	): Promise<boolean> {
		try {
			setLoading(true);
			setErrors(null);

			if (
				!firstName?.trim() ||
				!lastName?.trim() ||
				!email?.trim() ||
				!password?.trim()
			) {
				setErrors(['All fields are required.']);
				return false;
			}

			if (password.length < 8) {
				setErrors(['Password must be at least 8 characters long.']);
				return false;
			}

			await ensureCSRFToken();

			const response = await axiosInstance.post('register/', {
				first_name: firstName.trim(),
				last_name: lastName.trim(),
				email: email.trim().toLowerCase(),
				password: password,
			});

			if (response.status >= 200 && response.status < 300) {
				setAuth(response.data);
				return true;
			} else {
				setErrors(['Registration failed. Please try again.']);
				return false;
			}
		} catch (error: any) {
			console.error('Sign Up error:', error);
			setErrors(mapErrorToMessage(error));
			return false;
		} finally {
			setLoading(false);
		}
	}

	async function Login(email: string, password: string): Promise<boolean> {
		try {
			setLoading(true);
			setErrors(null);

			if (!email?.trim() || !password?.trim()) {
				setErrors(['Email and password are required.']);
				return false;
			}

			await ensureCSRFToken();

			const response = await axiosInstance.post('login/', {
				email: email.trim().toLowerCase(),
				password: password,
			});

			if (response.status >= 200 && response.status < 300) {
				setAuth(response.data);
				return true;
			} else {
				setErrors(['Login failed. Please try again.']);
				return false;
			}
		} catch (error: any) {
			console.error('Login error:', error);
			setErrors(mapErrorToMessage(error));
			return false;
		} finally {
			setLoading(false);
		}
	}

	async function ConfirmPassword(password: string): Promise<boolean> {
		try {
			setLoading(true);
			setErrors(null);

			if (!password?.trim()) {
				setErrors(['Password is required.']);
				return false;
			}

			await ensureCSRFToken();

			const response = await axiosInstance.post('confirm_password/', {
				password: password,
			});

			if (response.status >= 200 && response.status < 300) {
				return true;
			} else {
				setErrors(['Password confirmation failed.']);
				return false;
			}
		} catch (error: any) {
			console.error('ConfirmPassword error:', error);
			setErrors(mapErrorToMessage(error));
			return false;
		} finally {
			setLoading(false);
		}
	}

	async function PasswordReset(
		token: string | undefined,
		password: string,
	): Promise<boolean> {
		try {
			setLoading(true);
			setErrors(null);

			if (!token || !password?.trim()) {
				setErrors(['Invalid reset token or password.']);
				return false;
			}

			if (password.length < 8) {
				setErrors(['Password must be at least 8 characters long.']);
				return false;
			}

			await ensureCSRFToken();

			const response = await axiosInstance.post('password_reset/confirm/', {
				password: password,
				token: token,
			});

			if (response.status >= 200 && response.status < 300) {
				return true;
			} else {
				setErrors(['Password reset failed. Please try again.']);
				return false;
			}
		} catch (error: any) {
			console.error('PasswordReset error:', error);
			setErrors(mapErrorToMessage(error));
			return false;
		} finally {
			setLoading(false);
		}
	}

	async function ForgotPassword(email: string): Promise<string | null> {
		try {
			setLoading(true);
			setErrors(null);

			if (!email?.trim()) {
				setErrors(['Email is required.']);
				return null;
			}

			await ensureCSRFToken();

			const response = await axiosInstance.post('password_reset/', {
				email: email.trim().toLowerCase(),
			});

			if (response.status >= 200 && response.status < 300) {
				return response.data.token || 'success';
			} else {
				setErrors(['Failed to send reset email. Please try again.']);
				return null;
			}
		} catch (error: any) {
			console.error('ForgotPassword error:', error);
			setErrors(mapErrorToMessage(error));
			return null;
		} finally {
			setLoading(false);
		}
	}

	async function VerifyEmail(email: string): Promise<string | null> {
		try {
			setLoading(true);
			setErrors(null);

			if (!email?.trim()) {
				setErrors(['Email is required.']);
				return null;
			}

			await ensureCSRFToken();

			const response = await axiosInstance.post('verify_email/', {
				email: email.trim().toLowerCase(),
			});

			if (response.status >= 200 && response.status < 300) {
				return response.data.token || 'success';
			} else {
				setErrors(['Failed to send verification email. Please try again.']);
				return null;
			}
		} catch (error: any) {
			console.error('VerifyEmail error:', error);
			setErrors(mapErrorToMessage(error));
			return null;
		} finally {
			setLoading(false);
		}
	}

	async function Logout(): Promise<void> {
		try {
			setLoading(true);
			setErrors(null);

			setNotAuth();

			try {
				await axiosInstance.post('logout/');
				console.log('Server logout successful');
			} catch (error) {
				console.error(
					'Server logout failed (but local logout successful):',
					error,
				);
			}
		} catch (error: any) {
			console.error('Logout error:', error);
			setNotAuth();
		} finally {
			setLoading(false);
		}
	}

	const confirmAuth = useCallback(async () => {
		console.log('=== Starting auth confirmation ===');

		try {
			await ensureCSRFToken();
			console.log('CSRF token ensured, making auth/me request...');

			const response = await axiosInstance.get('auth/me/');
			console.log(
				'Auth confirmation response:',
				response.status,
				response.data,
			);

			if (response.status >= 200 && response.status < 300) {
				console.log('Auth confirmation successful');
				setAuth(response.data);
			} else {
				console.log('Auth confirmation failed - invalid response status');
				setNotAuth();
			}
		} catch (error: any) {
			console.error('Auth confirmation failed:', {
				message: error.message,
				status: error.response?.status,
				data: error.response?.data,
			});


			if (error.response?.status === 401 || error.response?.status === 403) {
				console.log('Clearing auth due to 401/403 response');
				setNotAuth();
			} else {
				console.log('Network/server error - keeping existing auth state');
				
			}
		} finally {
			console.log('Auth confirmation finished, setting checkingAuth to false');
			setCheckingAuth(false);
		}
	}, []);

	useEffect(() => {
		console.log('AuthProvider useEffect - checking cached data...');

		const cached = localStorage.getItem(USERDATA_STORAGE_KEY);
		if (cached) {
			try {
				const parsedData = JSON.parse(cached) as SharedData;
				console.log('Found cached auth data:', parsedData.auth.user.email);
				setSharedData(parsedData);
				setIsAuthenticated(true);
			} catch (error) {
				console.error('Error parsing cached auth data:', error);
				localStorage.removeItem(USERDATA_STORAGE_KEY);
			}
		} else {
			console.log('No cached auth data found');
		}

		confirmAuth();
	}, [confirmAuth]);

	return (
		<AuthContext.Provider
			value={{
				SignUp,
				Login,
				Logout,
				setErrors,
				setIsAuthenticated,
				setLoading,
				ForgotPassword,
				VerifyEmail,
				ConfirmPassword,
				PasswordReset,
				setSharedData,
				clearErrors,
				sharedData,
				checkingAuth,
				errors,
				isLoading,
				isAuthenticated,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthProvider;

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider');
	}
	return context;
};
