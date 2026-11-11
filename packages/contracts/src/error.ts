import { z } from 'zod';

/** Every non-2xx response from /v1 has this body. */
export const apiError = z.object({ code: z.string(), message: z.string() });
export type ApiErrorBody = z.infer<typeof apiError>;
