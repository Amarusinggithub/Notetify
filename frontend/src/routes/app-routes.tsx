import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { useAuth } from '../hooks/use-auth.tsx';

import AppLayout from '../layouts/app-layout.tsx';
import Welcome from '../pages//welcome.tsx';
import Login from '../pages/auth/login.tsx';
import Register from '../pages/auth/register.tsx';

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
		Component: Welcome,
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
