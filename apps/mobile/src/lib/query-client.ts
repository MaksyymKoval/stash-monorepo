import { QueryClient } from '@tanstack/react-query';

// Server state only. There is no other global store.
export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});
