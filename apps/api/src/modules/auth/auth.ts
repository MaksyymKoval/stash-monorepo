import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { APIError } from 'better-auth/api';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { db } from '../../infra/db/db.js';
import { profile } from './auth.schema.js';

// Sign-up body: { email, password, name, username }. Better Auth passes unknown
// fields through to ctx.body; the hooks below turn `username` into a profile row.
const usernameSchema = z.string().regex(/^[a-z0-9_.]{3,30}$/);

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true },
  plugins: [expo()],
  // The mobile app's scheme. The expo() plugin also trusts exp:// when NODE_ENV=development.
  trustedOrigins: ['makeupstash://'],
  databaseHooks: {
    user: {
      create: {
        // Rejects the sign-up before the user row exists.
        before: async (_user, ctx) => {
          const username = usernameSchema.safeParse(ctx?.body?.username);
          if (!username.success) {
            throw new APIError('BAD_REQUEST', {
              code: 'INVALID_USERNAME',
              message: 'Username: 3–30 characters, lowercase latin letters, digits, "_" or "."',
            });
          }
          const [taken] = await db.select({ id: profile.id }).from(profile).where(eq(profile.username, username.data));
          if (taken) throw new APIError('BAD_REQUEST', { code: 'USERNAME_TAKEN', message: 'Username is taken' });
        },
        // Runs after the user row is committed. A concurrent sign-up with the same
        // username can still fail here on the unique index; /v1/me then reports
        // PROFILE_NOT_FOUND (accepted for the MVP).
        after: async (user, ctx) => {
          await db.insert(profile).values({ userId: user.id, username: usernameSchema.parse(ctx?.body?.username) });
        },
      },
    },
  },
});

export type AuthSession = typeof auth.$Infer.Session;
