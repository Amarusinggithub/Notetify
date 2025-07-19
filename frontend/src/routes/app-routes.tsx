import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { useAuth } from '../hooks/use-auth';
import AppLayout from '../layouts/app-layout';
import SettingsLayout from '../layouts/settings/layout';
import Welcome from '../pages//welcome';
import Favorites from '../pages/app/favorites';
import Home from '../pages/app/home';
import ForgotPassword from '../pages/auth/forgot-password';
import Login from '../pages/auth/login';
import Register from '../pages/auth/register';
import ResetPassword from '../pages/auth/reset-password';
import VerifyEmail from '../pages/auth/verify-email';
import Authentication from '../pages/settings/authentication';
import General from '../pages/settings/general';

function AppRoutes() {
	const { isAuthenticated, checkingAuth } = useAuth();
	if (checkingAuth) return null;

	const publicRoutes = [
		{ index: true, Component: Welcome },
		{ path: 'login', Component: Login },
		{ path: 'forgot-password', Component: ForgotPassword },
		{ path: 'reset-password/:token', Component: ResetPassword },
		{ path: 'verify-email', Component: VerifyEmail },
		{ path: 'register', Component: Register },
		{ path: '*', Component: () => <Navigate to="/" replace /> },
	];

	const privateRoutes = [
		{
			path: '/',
			Component: AppLayout,
			children: [
				{ index: true, Component: Home },
				{ path: 'favorites', Component: Favorites },
			],
		},
		{
			path: 'settings',
			Component: SettingsLayout,
			children: [
				{ path: 'general', Component: General },
				{ path: 'authentication', Component: Authentication },
			],
		},

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
