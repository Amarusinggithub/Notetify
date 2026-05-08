import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 5, // Data is considered "fresh" for 5 minutes
                        refetchOnWindowFocus: false,
                    },
                    mutations: {
                        onError: (error) => toast.error(error.message),
                    },
                },
            }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
