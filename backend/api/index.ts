import 'reflect-metadata';
import express from 'express';
import type { Request, Response } from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { configure } from '../src/configure';

/**
 * Vercel serverless entry.
 *
 * Bootstrapping Nest costs a few hundred milliseconds, so the promise is
 * cached at module scope: a warm invocation reuses the already-initialised
 * app and only cold starts pay for it. The promise — not the app — is what is
 * cached, so two concurrent cold requests cannot bootstrap twice.
 */

const server = express();
let ready: Promise<void> | null = null;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn', 'log'],
  });
  configure(app);
  await app.init();
}

export default async function handler(req: Request, res: Response): Promise<void> {
  if (!ready) ready = bootstrap();

  try {
    await ready;
  } catch (error) {
    // A failed bootstrap must not be cached forever — clear it so the next
    // request retries rather than serving 500s until the next deploy.
    ready = null;
    throw error;
  }

  server(req, res);
}
