import React, {
	createContext,
	type PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import axiosInstance from '../lib/axios.ts';
import {
	type AuthErrorCode,
	type SharedData,
	USERDATA_STORAGE_KEY,
} from './../types';

type AuthProviderProps = PropsWithChildren;
interface AuthContextType {
	SignUp: (
		firstName: string,
		lastName: string,
		email: string,
		password: string,
		confirmPassword: string,
	) => void;
	Login: (email: string, password: string) => void;
	Logout: () => void;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setError: React.Dispatch<React.SetStateAction<AuthErrorCode[] | null>>;
	setUserData: React.Dispatch<any>;
	setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
	setSharedData: React.Dispatch<React.SetStateAction<SharedData | undefined>>;
	sharedData: SharedData | undefined;
	userData: any;
	errors: AuthErrorCode[] | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	checkingAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: AuthProviderProps) => {
	const [isLoading, setLoading] = useState<boolean>(false);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
	const [userData, setUserData] = useState<any>(null);
	const [errors, setError] = useState<AuthErrorCode[] | null>(null);
	const [sharedData, setSharedData] = useState<SharedData | undefined>();

	const setAuth = (userData: any) => {
		setIsAuthenticated(true);
		setUserData(userData);
		localStorage.setItem(USERDATA_STORAGE_KEY, JSON.stringify(userData));
	};

	const setNotAuth = () => {
		setIsAuthenticated(false);
		setUserData(null);
		localStorage.removeItem(USERDATA_STORAGE_KEY);
	};

	async function SignUp(
		firstName: string,
		lastName: string,
		email: string,
		password: string,
		confirmPassword: string,
	) {
		try {
			setLoading(true);
			setError(null);
			const tempErrors: AuthErrorCode[] = [];

			if (!firstName.trim())
				tempErrors.push('firstName:This field cannot be empty');
			if (!lastName.trim())
				tempErrors.push('lastName:This field cannot be empty');
			if (!email.trim()) tempErrors.push('email:This field cannot be empty');
			if (!password.trim())
				tempErrors.push('password:This field cannot be empty');
			if (!confirmPassword.trim())
				tempErrors.push('confirmPassword:This field cannot be empty');
			if (password && confirmPassword && password !== confirmPassword) {
				tempErrors.push(
					'confirmPassword:password and confirm password must match',
				);
			}

			if (tempErrors.length > 0) {
				setError(tempErrors);
				return;
			}

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
			console.error(
				'Signup error:',
				error.response ? error.response.data : error.message,
			);
			throw error;
		} finally {
			setLoading(false);
		}
	}

	async function Login(email: string, password: string) {
		try {
			setLoading(true);
			setError(null);
			const tempErrors: AuthErrorCode[] = [];

			if (!email.trim()) tempErrors.push('email:This field cannot be empty');
			if (!password.trim())
				tempErrors.push('password:This field cannot be empty');

			if (tempErrors.length > 0) {
				setError(tempErrors);
				return;
			}

			const response = await axiosInstance.post('login/', {
				email: email,
				password: password,
			});

			if (response.status >= 200 && response.status < 300) {
				setAuth(response.data);
			} else {
				console.error('Login failed');
			}
		} catch (error: any) {
			console.error(
				'Login error:',
				error.response ? error.response.data : error.message,
			);
			throw error;
		} finally {
			setLoading(false);
		}
	}

	async function Logout() {
		try {
			setLoading(true);
			setError(null);
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
			const response = await verifyAuth();
			if (response.status >= 200 && response.status < 300) {
				setAuth(response.data);
			} else {
				setNotAuth();
			}
		} catch (e: any) {
			setError(e);
			console.error(e);
			setNotAuth();
		} finally {
			setCheckingAuth(false);
		}
	}, []);

	useEffect(() => {
		const cached = localStorage.getItem(USERDATA_STORAGE_KEY);

		if (cached) setAuth(JSON.parse(cached));
		confirmAuth();
	}, [confirmAuth]);

	return (
		<AuthContext.Provider
			value={{
				SignUp,
				Login,
				Logout,
				setError,
				setIsAuthenticated,
				setLoading,
				setUserData,
sharedData			,	setSharedData,
				checkingAuth,
				userData,
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

export const verifyAuth = async () => {
	const response = await axiosInstance.get('auth/me/');
	return response;
};
