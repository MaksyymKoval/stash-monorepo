import { z } from 'zod';

/** Lowercase latin letters, digits, "_" and "."; 3–30 characters. Required at sign-up. */
export const username = z.string().regex(/^[a-z0-9_.]{3,30}$/);

/** GET /v1/me */
export const meResponse = z.object({
  id: z.string(),
  email: z.email(),
  username,
  bio: z.string().nullable(),
  avatarKey: z.string().nullable(),
  stashPublic: z.boolean(),
  createdAt: z.iso.datetime(),
});
export type MeResponse = z.infer<typeof meResponse>;
