import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import './App.css';
import AuthProvider from './hooks/use-auth.tsx';
import { NoteProvider } from './hooks/use-mutate-note.tsx';
import { TagProvider } from './hooks/use-mutate-tag.tsx';
import { SearchProvider } from './hooks/use-search-state.tsx';
import { SideNavProvider } from './hooks/use-side-nav.tsx';
import { ensureCSRFToken } from './lib/axios.ts';
import ErrorFallback from './pages/error';
import AppRoutes from './routes/app-routes.tsx';
import { initializeTheme } from './hooks/use-apperance.tsx';

ensureCSRFToken();
// This will set light / dark mode on load...
initializeTheme();

export default function App() {
	
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
