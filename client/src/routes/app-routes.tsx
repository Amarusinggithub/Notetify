import { Player } from '@lottiefiles/react-lottie-player';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import NotesLottie from '../assets/Notes.json';
import { notesLoader } from '../components/app-notes-sidebar.tsx';
import AppLayout from '../layouts/app-layout';
import SettingsLayout from '../layouts/settings/layout';
import Calender from '../pages/app/calender';
import Files from '../pages/app/files';
import Home from '../pages/app/home';
import Notebooks from '../pages/app/notebook';
import Notes from '../pages/app/notes';
import Shared from '../pages/app/shared-with-me';
import Spaces from '../pages/app/spaces';
import Tags from '../pages/app/tags';
import Tasks from '../pages/app/tasks';
import Trash from '../pages/app/trash';
import ForgotPassword from '../pages/auth/forgot-password';
import Login from '../pages/auth/login';
import Register from '../pages/auth/register';
import ResetPassword from '../pages/auth/reset-password';
import { TwoFactorVerification } from '../pages/auth/two-factor-verification';
import VerifyEmail from '../pages/auth/verify-email';
import Landing from '../pages/landing';
import Account from '../pages/settings/account';
import Authentication from '../pages/settings/authentication';
import Billing from '../pages/settings/billing';
import General from '../pages/settings/general';
import { useStore } from '../stores/index.ts';

function AppRoutes() {
	const { isAuthenticated, checkingAuth } = useStore();
	if (checkingAuth) return null;

	const publicRoutes = [
		{
			index: true,
			Component: Landing,
			HydrateFallback: () => (
				<div className="flex h-screen flex-col items-center justify-center gap-4">
					<Player src={NotesLottie} loop autoplay className="h-60 w-60" />
					<p className="text-muted-foreground text-lg">Loading...</p>
				</div>
			),
		},
		{
			path: 'login',
			Component: Login,
			HydrateFallback: () => (
				<div className="flex h-screen flex-col items-center justify-center gap-4">
					<Player src={NotesLottie} loop autoplay className="h-60 w-60" />
					<p className="text-muted-foreground text-lg">Loading...</p>
				</div>
			),
		},
		{
			path: 'forgot-password',
			Component: ForgotPassword,
			HydrateFallback: () => (
				<div className="flex h-screen flex-col items-center justify-center gap-4">
					<Player src={NotesLottie} loop autoplay className="h-60 w-60" />
					<p className="text-muted-foreground text-lg">Loading...</p>
				</div>
			),
		},
		{
			path: 'reset-password/:token',
			Component: ResetPassword,
			HydrateFallback: () => (
				<div className="flex h-screen flex-col items-center justify-center gap-4">
					<Player src={NotesLottie} loop autoplay className="h-60 w-60" />
					<p className="text-muted-foreground text-lg">Loading...</p>
				</div>
			),
		},
		{
			path: 'verify-email',
			Component: VerifyEmail,
			HydrateFallback: () => (
				<div className="flex h-screen flex-col items-center justify-center gap-4">
					<Player src={NotesLottie} loop autoplay className="h-60 w-60" />
					<p className="text-muted-foreground text-lg">Loading...</p>
				</div>
			),
		},
		{
			path: 'Two-factor-verification',
			Component: TwoFactorVerification,
			HydrateFallback: () => (
				<div className="flex h-screen flex-col items-center justify-center gap-4">
					<Player src={NotesLottie} loop autoplay className="h-60 w-60" />
					<p className="text-muted-foreground text-lg">Loading...</p>
				</div>
			),
		},
		{
			path: 'register',
			Component: Register,
			HydrateFallback: () => (
				<div className="flex h-screen flex-col items-center justify-center gap-4">
					<Player src={NotesLottie} loop autoplay className="h-60 w-60" />
					<p className="text-muted-foreground text-lg">Loading...</p>
				</div>
			),
		},
		{
			path: '*',
			Component: () => <Navigate to="/" replace />,
			HydrateFallback: () => (
				<div className="flex h-screen flex-col items-center justify-center gap-4">
					<Player src={NotesLottie} loop autoplay className="h-60 w-60" />
					<p className="text-muted-foreground text-lg">Loading...</p>
				</div>
			),
		},
	];

	const privateRoutes = [
		{
			path: '/',
			id: 'notes',
			loader: notesLoader,
			Component: AppLayout,
			HydrateFallback: () => (
				<div className="flex h-screen flex-col items-center justify-center gap-4">
					<Player src={NotesLottie} loop autoplay className="h-60 w-60" />
					<p className="text-muted-foreground text-lg">Loading your notes...</p>
				</div>
			),
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
					HydrateFallback: () => (
						<div className="flex h-screen flex-col items-center justify-center gap-4">
							<Player src={NotesLottie} loop autoplay className="h-60 w-60" />
							<p className="text-muted-foreground text-sm">
								Loading Settings...
							</p>
						</div>
					),
				},
				{ path: 'general', Component: General },
				{ path: 'account', Component: Account },
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
