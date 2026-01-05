import '@liveblocks/react-tiptap/styles.css';
import '@liveblocks/react-ui/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import './App.css';
import { TagProvider } from './hooks/use-mutate-tag.tsx';
import ErrorFallback from './pages/error.tsx';
import AppRoutes from './routes/app-routes.tsx';

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
			<QueryClientProvider client={queryClient}>
				<TagProvider>
					<AppRoutes />
				</TagProvider>
			</QueryClientProvider>
		</ErrorBoundary>
	);
}
