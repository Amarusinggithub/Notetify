import { lazy } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { notesLoader } from '../components/app-notes-sidebar.tsx';
import AppLayout from '../layouts/app-layout';
import SettingsLayout from '../layouts/settings/layout';
import Home from '../pages/app/home';
import Landing from '../pages/landing';
import { useStore } from '../stores/index.ts';

function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
	return (
		<div className="flex h-screen flex-col items-center justify-center gap-4">
			<div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-500" />
			<p className="text-muted-foreground text-lg">{message}</p>
		</div>
	);
}

const Notes = lazy(() => import('../pages/app/notes'));
const Notebooks = lazy(() => import('../pages/app/notebook'));
const Files = lazy(() => import('../pages/app/files'));
const Calender = lazy(() => import('../pages/app/calender'));
const Tasks = lazy(() => import('../pages/app/tasks'));
const Shared = lazy(() => import('../pages/app/shared'));
const Tags = lazy(() => import('../pages/app/tags'));
const Spaces = lazy(() => import('../pages/app/spaces'));
const Trash = lazy(() => import('../pages/app/trash'));
const Billing = lazy(() => import('../pages/settings/billing'));
const General = lazy(() => import('../pages/settings/general'));
const Authentication = lazy(() => import('../pages/settings/authentication'));
const ForgotPassword = lazy(() => import('../pages/auth/forgot-password'));
const ResetPassword = lazy(() => import('../pages/auth/reset-password'));
const VerifyEmail = lazy(() => import('../pages/auth/verify-email'));
const TwoFactorVerification = lazy(
	() => import('../pages/auth/two-factor-verification')
);
const Register = lazy(() => import('../pages/auth/register'));
const Login = lazy(() => import('../pages/auth/login'));

function AppRoutes() {
	const { isAuthenticated, checkingAuth } = useStore();
	if (checkingAuth) return null;

	const publicRoutes = [
		{
			index: true,
			Component: Landing,
			HydrateFallback: LoadingSpinner,
		},
		{
			path: 'login',
			Component: Login,
			HydrateFallback: LoadingSpinner,
		},
		{
			path: 'forgot-password',
			Component: ForgotPassword,
			HydrateFallback: LoadingSpinner,
		},
		{
			path: 'reset-password/:token',
			Component: ResetPassword,
			HydrateFallback: LoadingSpinner,
		},
		{
			path: 'verify-email',
			Component: VerifyEmail,
			HydrateFallback: LoadingSpinner,
		},
		{
			path: 'Two-factor-verification',
			Component: TwoFactorVerification,
			HydrateFallback: LoadingSpinner,
		},
		{
			path: 'register',
			Component: Register,
			HydrateFallback: LoadingSpinner,
		},
		{
			path: '*',
			Component: () => <Navigate to="/" replace />,
			HydrateFallback: LoadingSpinner,
		},
	];

	const privateRoutes = [
		{
			path: '/',
			id: 'notes',
			loader: notesLoader,
			Component: AppLayout,
			HydrateFallback: () => <LoadingSpinner message="Loading your notes..." />,
			children: [
				{ index: true, Component: Home },
				{ path: 'trash', Component: Trash },
				{ path: 'shared', Component: Shared },
				{ path: 'files', Component: Files },
				{ path: 'calender', Component: Calender },
				{ path: 'tags', Component: Tags },
				{ path: 'notebooks', Component: Notebooks },
				{ path: 'spaces', Component: Spaces },
				{ path: 'notes', Component: Notes },
				{ path: 'notes/:noteId', Component: Notes },
				{ path: 'tasks', Component: Tasks },
			],
		},
		{
			path: 'settings',
			Component: SettingsLayout,
			children: [
				{
					index: true,
					Component: () => <Navigate to="/settings/general" replace />,
					HydrateFallback: () => <LoadingSpinner message="Loading Settings..." />,
				},
				{ path: 'general', Component: General },
				{ path: 'authentication', Component: Authentication },
				{ path: 'billing', Component: Billing },
			],
		},

		{ path: '*', Component: () => <Navigate to="/" replace /> },
	];

	const router = createBrowserRouter(
		isAuthenticated ? privateRoutes : publicRoutes
	);

	return (
		<RouterProvider router={router} key={isAuthenticated ? 'auth' : 'guest'} />
	);
}

export default AppRoutes;
