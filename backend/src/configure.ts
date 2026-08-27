import { INestApplication, ValidationPipe } from '@nestjs/common';

/**
 * Shared setup for both entry points — `main.ts` locally and `api/index.ts` on
 * Vercel. Keeping it in one place means the deployed app cannot quietly differ
 * from the one you tested.
 */
export function configure(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip properties with no decorator
      forbidNonWhitelisted: true, // ...and reject the request that sent them
      transform: true,
      validationError: { target: false, value: false },
    }),
  );

  app.enableCors({
    origin: allowedOrigins(),
    methods: ['GET', 'POST', 'OPTIONS'],
    // Authorization is needed by the résumé upload endpoint.
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86_400,
  });
}

/**
 * ALLOWED_ORIGIN is a comma-separated list. Localhost is added outside
 * production so `npm run dev` on the frontend works without extra config.
 */
export function allowedOrigins(): string[] {
  const configured = (process.env.ALLOWED_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV === 'production') return configured;

  return [...configured, 'http://localhost:5173', 'http://127.0.0.1:5173'];
}
