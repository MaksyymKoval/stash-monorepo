import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';
import { env } from './env';

// Session cookie lives in SecureStore, so the session survives app restarts.
export const authClient = createAuthClient({
  baseURL: env.apiUrl,
  plugins: [expoClient({ scheme: 'makeupstash', storagePrefix: 'makeupstash', storage: SecureStore })],
});
