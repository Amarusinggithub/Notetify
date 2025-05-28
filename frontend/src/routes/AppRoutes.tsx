import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import AppLayout from '../layouts/AppLayout.tsx';
import Archive from '../pages/Archive.tsx';
import Favorite from '../pages/Favorites.tsx';
import Home from '../pages/Home.tsx';
import Landing from '../pages/Landing.tsx';
import Login from '../pages/Login.tsx';
import Register from '../pages/Register.tsx';
import Tag from '../pages/Tag.tsx';
import Trash from '../pages/Trash.tsx';
import { useAuth } from './../hooks/useAuth.tsx';

const AppRoutes = () => {
	const { isAuthenticated, checkingAuth } = useAuth();
	if (checkingAuth) return null;

	return (
		<RouterProvider
			router={createBrowserRouter(isAuthenticated ? privateRoutes : publicRoutes)}
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
