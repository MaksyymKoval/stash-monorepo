import { SetMetadata } from '@nestjs/common';

/** Marks a route as reachable without a session. Read by the global AuthGuard. */
export const IS_PUBLIC = Symbol('isPublic');
export const Public = () => SetMetadata(IS_PUBLIC, true);
