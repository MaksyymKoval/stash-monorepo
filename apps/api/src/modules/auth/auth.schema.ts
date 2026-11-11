import { sql } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from './better-auth.schema.js';

/** App-side profile, one per Better Auth user. Created on sign-up (see auth.ts hooks). */
export const profile = pgTable('profile', {
  id: uuid('id').primaryKey().default(sql`uuidv7()`),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  username: text('username').notNull().unique(),
  bio: text('bio'),
  avatarKey: text('avatar_key'),
  stashPublic: boolean('stash_public').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
