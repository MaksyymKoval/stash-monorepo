import { meResponse } from '@stash/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { authClient } from '@/lib/auth-client';

export const meKey = ['me'] as const;

export function useMe() {
  return useQuery({ queryKey: meKey, queryFn: () => api('/me', meResponse) });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authClient.signOut(),
    // Drop everything cached for this user; the root layout switches to sign-in.
    onSuccess: () => queryClient.clear(),
  });
}
