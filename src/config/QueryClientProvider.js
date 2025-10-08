"use client"; // add this at the top
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

function QueryClientProviderWrapper({ children }) {
    // Create queryClient inside Client Component
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

export default QueryClientProviderWrapper;
