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
import { TwoFactorVerification } from '../pages/auth/two-factor-verification';
import Trash from '../pages/app/trash';
import Shared from '../pages/app/shared-with-me';
import Files from '../pages/app/files';
import Calender from '../pages/app/calender';
import Tags from '../pages/app/tags';
import Notebooks from '../pages/app/notebook';
import Notes from '../pages/app/notes';
import Tasks from '../pages/app/tasks';

function AppRoutes() {
	const { isAuthenticated, checkingAuth } = useAuth();
	if (checkingAuth) return null;

	const publicRoutes = [
		{ index: true, Component: Welcome },
		{ path: 'login', Component: Login },
		{ path: 'forgot-password', Component: ForgotPassword },
		{ path: 'reset-password/:token', Component: ResetPassword },
		{ path: 'verify-email', Component: VerifyEmail },
        { path: 'Two-factor-verification', Component: TwoFactorVerification },

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
				{ path: 'trash', Component: Trash },
				{ path: 'shared', Component: Shared },
				{ path: 'files', Component: Files },
				{ path: 'calender', Component: Calender },
				{ path: 'tags', Component: Tags },
				{ path: 'notebooks', Component: Notebooks },
				{ path: 'notes', Component: Notes },
				{ path: 'tasks', Component: Tasks },
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
