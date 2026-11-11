import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { env } from '../../config/env.js';
import { db } from '../../infra/db/db.js';

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true },
  plugins: [expo()],
  // The mobile app's scheme. The expo() plugin also trusts exp:// when NODE_ENV=development.
  trustedOrigins: ['makeupstash://'],
});

export type AuthSession = typeof auth.$Infer.Session;
