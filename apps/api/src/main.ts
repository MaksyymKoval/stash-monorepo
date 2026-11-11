import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NodeAdapter, type NestNodeApplication } from '@nestjs/platform-node';
import { toNodeHandler } from 'better-auth/node';
import { AppModule } from './app.module.js';
import { env } from './config/env.js';
import { auth } from './modules/auth/auth.js';

const app = await NestFactory.create<NestNodeApplication>(AppModule, new NodeAdapter(), {
  // The default parsers are registered in app.init() and would consume the request
  // stream before Better Auth sees it. They are off here and registered below,
  // after the auth handler, so they apply to every route except /api/auth/*.
  bodyParser: false,
});

// ORDER MATTERS (docs/decisions/0002-better-auth-node-adapter.md).
// 1. Better Auth is mounted first: /api/auth and every sub-path, outside the Nest
//    pipeline (no guards, interceptors, filters or /v1 prefix). It ends the response.
//    Logging or rate limiting for it must be added with app.use() ABOVE this line.
// 2. Nothing that reads the request body may be registered before it.
app.use('/api/auth', toNodeHandler(auth));
// 3. Only now the body parsers, for the Nest routes.
app.useBodyParser('json');
app.useBodyParser('urlencoded', { extended: true });

app.setGlobalPrefix('v1');
app.enableShutdownHooks();
await app.listen(env.PORT);
