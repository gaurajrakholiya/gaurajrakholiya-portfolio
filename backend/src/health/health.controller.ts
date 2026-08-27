import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      uptime: Math.round(process.uptime()),
      // Whether delivery is wired up, without leaking the key itself. Useful
      // when the form starts 503-ing and you need to know why in one request.
      deliveryConfigured: Boolean(
        process.env.RESEND_API_KEY &&
          process.env.CONTACT_TO_EMAIL &&
          process.env.CONTACT_FROM_EMAIL,
      ),
    };
  }
}
