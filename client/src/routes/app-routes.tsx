import { lazy } from 'react';
import {
	createBrowserRouter,
	Navigate,
	RouterProvider,
	type RouteObject,
} from 'react-router';
import { notesLoader } from '@/components/app/app-notes-sidebar';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import LandingLayout from '@/layouts/landing/layout';
import LoadingPage from '@/pages/loading';
import { useStore } from '@/stores/index';

const NotFound = lazy(() => import('@/pages/not-found'));
const Notes = lazy(() => import('@/pages/app/notes'));
const Notebooks = lazy(() => import('@/pages/app/notebook'));
const Files = lazy(() => import('@/pages/app/files'));
const Calender = lazy(() => import('@/pages/app/calender'));
const Tasks = lazy(() => import('@/pages/app/tasks'));
const Shared = lazy(() => import('@/pages/app/shared'));
const Tags = lazy(() => import('@/pages/app/tags'));
const Spaces = lazy(() => import('@/pages/app/spaces'));
const Trash = lazy(() => import('@/pages/app/trash'));
const Billing = lazy(() => import('@/pages/settings/billing'));
const General = lazy(() => import('@/pages/settings/general'));
const Authentication = lazy(() => import('@/pages/settings/authentication'));
const ForgotPassword = lazy(() => import('@/pages/auth/forgot-password'));
const ResetPassword = lazy(() => import('@/pages/auth/reset-password'));
const VerifyEmail = lazy(() => import('@/pages/auth/verify-email'));
const TwoFactorVerification = lazy(
	() => import('@/pages/auth/two-factor-verification')
);
const Register = lazy(() => import('@/pages/auth/register'));
const Login = lazy(() => import('@/pages/auth/login'));
const Home = lazy(() => import('@/pages/app/home'));
const Landing = lazy(() => import('@/pages/landing'));

function AppRoutes() {
	const checkingAuth = useStore((state) => state.checkingAuth);
	const isAuthenticated = useStore((state) => state.isAuthenticated);

	if (checkingAuth) return <LoadingPage message="Checking session..." />;

	const publicRoutes: RouteObject[] = [
		{
			Component: LandingLayout,
			HydrateFallback: LoadingPage,
			children: [
				{ index: true, Component: Landing },
			],
		},
		{
			path: 'login',
			Component: Login,
			HydrateFallback: LoadingPage,
		},
		{
			path: 'forgot-password',
			Component: ForgotPassword,
			HydrateFallback: LoadingPage,
		},
		{
			path: 'reset-password/:token',
			Component: ResetPassword,
			HydrateFallback: LoadingPage,
		},
		{
			path: 'verify-email',
			Component: VerifyEmail,
			HydrateFallback: LoadingPage,
		},
		{
			path: 'Two-factor-verification',
			Component: TwoFactorVerification,
			HydrateFallback: LoadingPage,

		},
		{
			path: 'register',
			Component: Register,
			HydrateFallback: LoadingPage,
		},
		{
			path: '*',
			Component: NotFound,
			HydrateFallback: LoadingPage,
		},
	];

	const privateRoutes: RouteObject[] = [
		{
			path: '/',
			id: 'notes',
			Component: AppLayout,
			HydrateFallback: () => <LoadingPage message="Loading Your Workspace..." />,
			children: [
				{ index: true, Component: Home },
				{ path: 'trash', Component: Trash },
				{ path: 'shared', Component: Shared },
				{ path: 'files', Component: Files },
				{ path: 'calender', Component: Calender },
				{ path: 'tags', Component: Tags },
				{ path: 'notebooks', Component: Notebooks },
				{ path: 'spaces', Component: Spaces },
				{ path: 'notes', Component: Notes, loader: notesLoader },
				{ path: 'notes/:noteId', Component: Notes, loader: notesLoader },
				{ path: 'tasks', Component: Tasks },
				{ path: '*', Component: NotFound },
			],
		},
		{
			path: 'settings',
			Component: SettingsLayout,
			children: [
				{
					index: true,
					Component: () => <Navigate to="/settings/general" replace />,
					HydrateFallback: () => <LoadingPage message="Loading Settings..." />,
				},
				{ path: 'general', Component: General },
				{ path: 'authentication', Component: Authentication },
				{ path: 'billing', Component: Billing },
				{ path: '*', Component: NotFound },
			],
		},

		{ path: '*', Component: NotFound },
	];

	const router = createBrowserRouter(
		isAuthenticated ? privateRoutes : publicRoutes
	);

	return (
		<RouterProvider router={router} key={isAuthenticated ? 'auth' : 'guest'} />
	);
}

export default AppRoutes;
