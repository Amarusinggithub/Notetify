import React, {
	createContext,
	type PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import axiosInstance from '../lib/axios.ts';
import { type SharedData, type User, USERDATA_STORAGE_KEY } from './../types';

type AuthProviderProps = PropsWithChildren;
interface AuthContextType {
	SignUp: (
		firstName: string,
		lastName: string,
		email: string,
		password: string,
	) => void;
	Login: (email: string, password: string) => void;
	Logout: () => void;
	PasswordReset: (token: string | undefined, password: string) => void;
	ForgotPassword: (email: string) => void;
	VerifyEmail: (email: string) => void;
	ConfirmPassword: (password: string) => void;

	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setErrors: React.Dispatch<React.SetStateAction<any | null>>;
	setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
	setSharedData: React.Dispatch<React.SetStateAction<SharedData | null>>;
	sharedData: SharedData | null;
	errors: any | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	checkingAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: AuthProviderProps) => {
	const [isLoading, setLoading] = useState<boolean>(false);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
	const [errors, setErrors] = useState<any | null>(null);
	const [sharedData, setSharedData] = useState<SharedData | null>(null);

	const setAuth = (apiReponse: any) => {
		const user: User = {
            id:apiReponse.id,
			first_name: apiReponse.first_name,
			last_name: apiReponse.last_name,
			email: apiReponse.email,
			is_active: apiReponse.is_active,
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
	};

	const setNotAuth = () => {
		setIsAuthenticated(false);
		localStorage.removeItem(USERDATA_STORAGE_KEY);
	};

	async function SignUp(
		firstName: string,
		lastName: string,
		email: string,
		password: string,
	) {
		try {
			setLoading(true);
			setErrors(null);

			const response = await axiosInstance.post('register/', {
				first_name: firstName,
				last_name: lastName,
				email: email,
				password: password,
			});

			if (response.status >= 200 && response.status < 300) {
				setAuth(response.data);
			} else {
				console.error('Signup failed');
			}
		} catch (error: any) {
			console.error('Sign Up error:', error);
			setErrors(['auth:unknown']);
		} finally {
			setLoading(false);
		}
	}

	async function Login(email: string, password: string) {
		try {
			setLoading(true);
			setErrors(null);

			const response = await axiosInstance.post('login/', {
				email: email,
				password: password,
			});

			if (response.status >= 200 && response.status < 300) {
                console.log(response.data);
				setAuth(response.data);
			} else {
				console.error('Login failed');
			}
		} catch (error: any) {
			console.error('Login error:', error);
			setErrors(['auth:unknown']);
		} finally {
			setLoading(false);
		}
	}

	async function ConfirmPassword(password: string) {
		try {
			setLoading(true);
			setErrors(null);

			const response = await axiosInstance.post('confirm_password/', {
				password: password,
			});
		} catch (error: any) {
			console.error('ConfirmPassword error:', error);
			setErrors(['auth:unknown']);
		} finally {
			setLoading(false);
		}
	}
	async function PasswordReset(token: string | undefined, password: string) {
		try {
			setLoading(true);
			setErrors(null);

			const response = await axiosInstance.post('password_reset/confirm/', {
				password: password,
				token: token,
			});
		} catch (error: any) {
			console.error('PasswordReset error:', error);
			setErrors(['auth:unknown']);
		} finally {
			setLoading(false);
		}
	}

	async function ForgotPassword(email: string) {
		try {
			setLoading(true);
			setErrors(null);

			const response = await axiosInstance.post('password_reset/', {
				email: email,
			});

			return response.data.token;
		} catch (error: any) {
			console.error('ForgotPassword error:', error);
			setErrors(['auth:unknown']);
		} finally {
			setLoading(false);
		}
	}

	async function VerifyEmail(email: string) {
		try {
			setLoading(true);
			setErrors(null);

			const response = await axiosInstance.post('verify_email/', {
				email: email,
			});

			return response.data.token;
		} catch (error: any) {
			console.error('VerifyEmail error:', error);
			setErrors(['auth:unknown']);
		} finally {
			setLoading(false);
		}
	}

	async function Logout() {
		try {
			setLoading(true);
			setErrors(null);
			const response = await axiosInstance.post('logout/');
			return response;
		} catch (error: any) {
			console.error(
				'Logout error:',
				error.response ? error.response.data : error.message,
			);
			throw error;
		} finally {
			setNotAuth();
			setLoading(false);
		}
	}

	const confirmAuth = useCallback(async () => {
		try {
			const response = await axiosInstance.get('auth/me/');
			if (response.status >= 200 && response.status < 300) {
				setAuth(response.data);
			} else {
				setNotAuth();
			}
		} catch (e: any) {
			setErrors(e);
			console.error(e);
			setNotAuth();
		} finally {
			setCheckingAuth(false);
		}
	}, []);

	useEffect(() => {
		const cached = localStorage.getItem(USERDATA_STORAGE_KEY);

		if (cached) {
			setSharedData(JSON.parse(cached) as SharedData);
			setIsAuthenticated(true);
		}
		confirmAuth();
	}, [confirmAuth]);

	return (
		<AuthContext.Provider
			value={{
				SignUp,
				Login,
				Logout,
				setErrors: setErrors,
				setIsAuthenticated,
				setLoading,
				ForgotPassword,
				VerifyEmail,
				ConfirmPassword,
				PasswordReset,
				setSharedData,
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
