import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { IncomingMessage } from 'node:http';
import type { AuthSession } from './auth.js';

/** The request after AuthGuard has attached the session to it. */
export type AuthRequest = IncomingMessage & { user?: AuthSession['user']; session?: AuthSession['session'] };

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest<AuthRequest>().user,
);
