import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configure } from './configure';

/** Local development server. Vercel uses `api/index.ts` instead. */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configure(app);

  const port = Number(process.env.PORT ?? 3011);
  await app.listen(port);

  new Logger('Bootstrap').log(`Contact API listening on http://localhost:${port}`);
}

void bootstrap();
