import React, {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { login, logout, signUp, verifyAuth } from '../lib/AuthService.ts';
import { USERDATA_STORAGE_KEY } from './../types/index.ts';

type AuthProviderProps = PropsWithChildren;
interface AuthContextType {
	handleSignup: (
		email: string,
		username: string,
		password: string,
	) => Promise<void>;
	handleLogin: (username: string, password: string) => Promise<void>;
	handleLogout: () => Promise<void>;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setError: React.Dispatch<React.SetStateAction<any>>;
	setUserData: React.Dispatch<any>;
	setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
	userData: any;
	error: any;
	isLoading: boolean;
	isAuthenticated: boolean;
	checkingAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: AuthProviderProps) => {
	const { showBoundary } = useErrorBoundary();
	const [isLoading, setLoading] = useState<boolean>(false);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
	const [userData, setUserData] = useState<any>(null);
	const [error, setError] = useState(null);

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

	const handleSignup = async (
		email: string,
		username: string,
		password: string,
	) => {
		try {
			setLoading(true);
			setError(null);
			const response = await signUp(email, username, password);
			if (response.status >= 200 && response.status < 300) {
				console.log('Signup successful');
				setAuth(response.data);
			} else {
				console.error('Signup failed');
			}
		} catch (error: any) {
			console.error('Error during signup:', error);
			setError(error);
			showBoundary(error);
		} finally {
			setLoading(false);
		}
	};

	const handleLogin = async (email: string, password: string) => {
		try {
			setLoading(true);
			setError(null);
			const response = await login(email.trim(), password.trim());
			if (response.status >= 200 && response.status < 300) {
				console.log('Login successful');
				setAuth(response.data);
			} else {
				console.error('Login failed');
			}
		} catch (error: any) {
			console.error('Error during login:', error);
			setError(error);
			showBoundary(error);
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		try {
			setLoading(true);
			setError(null);
			await logout();
		} catch (error: any) {
			console.error('Error during logout:', error);
			setError(error);
			showBoundary(error);
		} finally {
			setNotAuth();
			setLoading(false);
		}
	};

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
		let cached = localStorage.getItem(USERDATA_STORAGE_KEY);

		if (cached) setAuth(JSON.parse(cached));
		confirmAuth();
	}, [confirmAuth]);

	return (
		<AuthContext.Provider
			value={{
				handleSignup,
				handleLogin,
				handleLogout,
				setError,
				setIsAuthenticated,
				setLoading,
				setUserData,
				checkingAuth,
				userData,
				error,
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
