import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import './App.css';
import AuthProvider from './hooks/useAuth.tsx';
import { SideNavProvider } from './hooks/useSideNav.tsx';
import { TagProvider } from './hooks/useTag.tsx';
import { ensureCSRFToken } from './lib/AxiosService.ts';
import ErrorFallback from './pages/Error';
import AppRoutes from './routes/AppRoutes.tsx';
import { NoteProvider } from './hooks/useNote.tsx';

export default function App() {
	useEffect(() => {
		const initialize = async () => {
			await ensureCSRFToken();
		};
		initialize();
	}, []);

	const queryClient = new QueryClient();

	return (
		<ErrorBoundary FallbackComponent={ErrorFallback}>
			<Suspense fallback={<div>Loading...</div>}>
				<QueryClientProvider client={queryClient}>
					<AuthProvider>
						<NoteProvider>
							<TagProvider>
								<SideNavProvider>
									<AppRoutes />
								</SideNavProvider>
							</TagProvider>
						</NoteProvider>
					</AuthProvider>
				</QueryClientProvider>
			</Suspense>
		</ErrorBoundary>
	);
}
