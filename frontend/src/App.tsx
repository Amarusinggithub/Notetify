import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import './App.css';
import AuthProvider from './hooks/useAuth.tsx';
import { NoteProvider } from './hooks/useNote.tsx';
import { SideNavProvider } from './hooks/useSideNav.tsx';
import { TagProvider } from './hooks/useTag.tsx';
import { ensureCSRFToken } from './lib/AxiosService.ts';
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
		<ErrorBoundary fallback={<div>Something went wrong</div>}>
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
		</ErrorBoundary>
	);
}
