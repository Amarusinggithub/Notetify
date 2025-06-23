import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { useAuth } from '../hooks/use-auth.tsx';

/*const AppLayout = lazy(() => import('../layouts/AppLayout.tsx'));
const Home = lazy(() => import('../pages/Home.tsx'));
const Archive = lazy(() => import('../pages/Archive.tsx'));
const Favorite = lazy(() => import('../pages/Favorites.tsx'));
const Tag = lazy(() => import('../pages/Tag.tsx'));
const Trash = lazy(() => import('../pages/Trash.tsx'));
const Landing = lazy(() => import('../pages/Landing.tsx'));
const Login = lazy(() => import('../pages/auth/Login.tsx'));
const Register = lazy(() => import('../pages/auth/Register.tsx'));*/

import AppLayout from '../layouts/app-layout.tsx';
import Archive from '../pages/archive.tsx';
import Login from '../pages/auth/login.tsx';
import Register from '../pages/auth/register.tsx';
import Favorite from '../pages/favorites.tsx';
import Home from '../pages/home.tsx';
import Landing from '../pages/landing.tsx';
import Tag from '../pages/tag.tsx';
import Trash from '../pages/trash.tsx';

const AppRoutes = () => {
	const { isAuthenticated, checkingAuth } = useAuth();
	if (checkingAuth) return null;

	return (
		<RouterProvider
			router={createBrowserRouter(
				isAuthenticated ? privateRoutes : publicRoutes,
			)}
			key={isAuthenticated ? 'auth' : 'guest'}
		/>
	);
};

export default AppRoutes;

const publicRoutes = [
	{
		path: '/',
		Component: Landing,
	},
	{ path: '/login', Component: Login },
	{ path: '/register', Component: Register },
	{ path: '*', Component: () => <Navigate to="/" replace /> },
];

const privateRoutes = [
	{
		path: '/',
		Component: AppLayout,
		children: [
			{
				index: true,
				Component: Home,
			},
			{
				path: ':noteid',
				Component: Home,
			},
			{
				path: 'favorite',
				Component: Favorite,
				children: [
					{
						path: ':noteid',
					},
				],
			},
			{
				path: 'archive',
				Component: Archive,
				children: [
					{
						path: ':noteid',
					},
				],
			},
			{
				path: 'tag',
				Component: Tag,
				children: [
					{
						path: ':noteid',
					},
				],
			},
			{
				path: 'trash',
				Component: Trash,
				children: [
					{
						path: ':noteid',
					},
				],
			},

			{
				path: '/login',
				Component: () => <Navigate to="/" replace />,
			},
			{
				path: '/register',
				Component: () => <Navigate to="/" replace />,
			},
			{ path: '*', Component: () => <Navigate to="/" replace /> },
		],
	},
];
