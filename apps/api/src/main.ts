import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NodeAdapter, type NestNodeApplication } from '@nestjs/platform-node';
import { AppModule } from './app.module.js';
import { env } from './config/env.js';

const app = await NestFactory.create<NestNodeApplication>(AppModule, new NodeAdapter());

app.setGlobalPrefix('v1');
app.enableShutdownHooks();
await app.listen(env.PORT);
