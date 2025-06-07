import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import './App.css';
import AuthProvider from './hooks/useAuth.tsx';
import { NoteProvider } from './hooks/useMutateNote.tsx';
import { TagProvider } from './hooks/useMutateTag.tsx';
import { SearchProvider } from './hooks/useSearchState.tsx';
import { SideNavProvider } from './hooks/useSideNav.tsx';
import { ensureCSRFToken } from './lib/AxiosService.ts';
import ErrorFallback from './pages/Error';
import AppRoutes from './routes/AppRoutes.tsx';

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
				<QueryClientProvider client={queryClient}>
					<AuthProvider>
						<SearchProvider>
							<NoteProvider>
								<TagProvider>
									<SideNavProvider>
										<AppRoutes />
									</SideNavProvider>
								</TagProvider>
							</NoteProvider>
						</SearchProvider>
					</AuthProvider>
				</QueryClientProvider>
		</ErrorBoundary>
	);
}
