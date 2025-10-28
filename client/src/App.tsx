import '@liveblocks/react-tiptap/styles.css';
import '@liveblocks/react-ui/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import './App.css';
import { TagProvider } from './hooks/use-mutate-tag.tsx';
import { PageProvider } from './hooks/use-page.tsx';

import ErrorFallback from './pages/error.tsx';
import AppRoutes from './routes/app-routes.tsx';


export default function App() {
    const queryClient = new QueryClient();

    return (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <QueryClientProvider client={queryClient}>
                        <PageProvider>
                            <TagProvider>
                                <AppRoutes />
                            </TagProvider>
                        </PageProvider>
                </QueryClientProvider>
            </ErrorBoundary>
    );
}
