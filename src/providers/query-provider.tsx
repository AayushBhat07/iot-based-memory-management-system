
import { QueryClient, QueryClientProvider as TanstackQueryProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
    },
  },
});

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <TanstackQueryProvider client={queryClient}>
      {children}
    </TanstackQueryProvider>
  );
}
