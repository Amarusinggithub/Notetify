import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import './App.css';
import { initializeTheme } from './hooks/use-apperance.tsx';
import AuthProvider from './hooks/use-auth.tsx';
import { NoteProvider } from './hooks/use-mutate-note.tsx';
import { TagProvider } from './hooks/use-mutate-tag.tsx';
import { PageProvider } from './hooks/use-page.tsx';
import { SearchProvider } from './hooks/use-search-state.tsx';
import { ThemeProvider } from './hooks/use-theme.tsx';
import { ensureCSRFToken } from './lib/axios.ts';
import ErrorFallback from './pages/error.tsx';
import AppRoutes from './routes/app-routes.tsx';

ensureCSRFToken();

// This will set light / dark mode on load...
initializeTheme();

export default function App() {
	const queryClient = new QueryClient();

	return (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<ErrorBoundary FallbackComponent={ErrorFallback}>
				<QueryClientProvider client={queryClient}>
					<AuthProvider>
						<PageProvider>
							<SearchProvider>
								<NoteProvider>
									<TagProvider>
										<AppRoutes />
									</TagProvider>
								</NoteProvider>
							</SearchProvider>
						</PageProvider>
					</AuthProvider>
				</QueryClientProvider>
			</ErrorBoundary>
		</ThemeProvider>
	);
}
