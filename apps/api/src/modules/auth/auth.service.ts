import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from '../../infra/db/db.js';
import type { AuthSession } from './auth.js';
import { profile } from './auth.schema.js';

@Injectable()
export class AuthService {
  async me(user: AuthSession['user']) {
    const [row] = await db.select().from(profile).where(eq(profile.userId, user.id));
    if (!row) throw new NotFoundException({ code: 'PROFILE_NOT_FOUND', message: 'Profile not found' });

    return {
      id: user.id,
      email: user.email,
      username: row.username,
      bio: row.bio,
      avatarKey: row.avatarKey,
      stashPublic: row.stashPublic,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
