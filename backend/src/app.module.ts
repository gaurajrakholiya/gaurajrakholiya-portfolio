import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ContactModule } from './contact/contact.module';
import { ResumeModule } from './resume/resume.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      // Baseline for every route; ContactController tightens it with @Throttle.
      throttlers: [{ name: 'default', limit: 30, ttl: 60_000 }],
    }),
    ContactModule,
    ResumeModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
