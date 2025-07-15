import { useAuth } from '../hooks/use-auth';
import Settings from '../pages/settings/settings';
import Home from '../pages/home';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import Welcome from '../pages//welcome';
import Login from '../pages/auth/login';
import Register from '../pages/auth/register';
import ForgotPassword from '../pages/auth/forgot-password';
import ResetPassword from '../pages/auth/reset-password';
import VerifyEmail from '../pages/auth/verify-email';

function AppRoutes() {
	const { isAuthenticated, checkingAuth } = useAuth();
	if (checkingAuth) return null;

	const publicRoutes = [
		{ index: true, Component: Welcome },
		{ path: 'login', Component: Login },
		{ path: 'forgot-password', Component: ForgotPassword },
		{ path: 'reset-password', Component: ResetPassword },
		{ path: 'verify-email', Component: VerifyEmail },
		{ path: 'register', Component: Register },
		{ path: '*', Component: () => <Navigate to="/" replace /> },
	];

	const privateRoutes = [
		{ index: true, Component: Home },

		{ path: 'settings', Component: Settings },
		{ path: 'verify-email', Component: VerifyEmail },
		{ path: 'forgot-password', Component: ForgotPassword },
		{ path: 'reset-password/:token', Component: ResetPassword },

		{ path: '*', Component: () => <Navigate to="/" replace /> },
	];

	const router = createBrowserRouter(
		isAuthenticated ? privateRoutes : publicRoutes,
	);

	return (
		<RouterProvider router={router} key={isAuthenticated ? 'auth' : 'guest'} />
	);
}

export default AppRoutes;
