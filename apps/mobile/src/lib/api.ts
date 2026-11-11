import { apiError } from '@makeupstash/contracts';
import type { z } from 'zod';
import { authClient } from './auth-client';
import { env } from './env';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

/**
 * The only way the app talks to /v1: adds the Better Auth session cookie and
 * validates the response with a schema from @makeupstash/contracts.
 */
export async function api<S extends z.ZodType>(path: string, schema: S, init: RequestInit = {}): Promise<z.infer<S>> {
  const headers = new Headers(init.headers);
  const cookie = await authClient.getCookie();
  if (cookie) headers.set('Cookie', cookie);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  // credentials: 'omit' so the native cookie jar does not interfere with the manual Cookie header.
  const res = await fetch(`${env.apiUrl}/v1${path}`, { ...init, headers, credentials: 'omit' });
  const body: unknown = await res.json().catch(() => undefined);

  if (!res.ok) {
    const err = apiError.safeParse(body);
    throw new ApiError(res.status, err.success ? err.data.code : 'UNKNOWN', err.success ? err.data.message : res.statusText);
  }
  return schema.parse(body);
}
