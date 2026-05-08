import { ErrorBoundary } from 'react-error-boundary';
import './App.css';
import ErrorFallback from '@/pages/error.tsx';
import AppRoutes from '@/routes/app-routes.tsx';
import { Suspense } from 'react';
import LoadingPage from './pages/loading';
import QueryProvider from './components/provider/query-provider';

export default function App() {
	return (
		<ErrorBoundary FallbackComponent={ErrorFallback}>
			<Suspense fallback={<LoadingPage />}>
				<QueryProvider>
					<AppRoutes />
				</QueryProvider>
			</Suspense>
		</ErrorBoundary>
	);
}
