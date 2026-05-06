import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import './App.css';
import ErrorFallback from '@/pages/error.tsx';
import AppRoutes from '@/routes/app-routes.tsx';
import { Suspense } from 'react';
import LoadingPage from './pages/loading';

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // Data is considered "fresh" for 5 minutes
		},
	},
});

export default function App() {
	return (
		<ErrorBoundary FallbackComponent={ErrorFallback}>
			<Suspense fallback={<LoadingPage />}>
				<QueryClientProvider client={queryClient}>
					<AppRoutes />
				</QueryClientProvider>
			</Suspense>
		</ErrorBoundary>
	);
}
