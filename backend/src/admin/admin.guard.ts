import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { timingSafeEqual } from 'node:crypto';

/**
 * Bearer-token guard for the résumé upload endpoint.
 *
 * One shared secret is the right weight here: there is exactly one
 * administrator and one privileged action. Comparison is timing-safe so the
 * token cannot be recovered a byte at a time, and a missing ADMIN_TOKEN denies
 * everything rather than defaulting open.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.ADMIN_TOKEN;

    // Fail closed. An unset token must never mean "allow".
    if (!expected || expected.length < 16) {
      throw new UnauthorizedException('Uploads are not configured on this deployment.');
    }

    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers.authorization ?? '';
    const provided = header.startsWith('Bearer ') ? header.slice(7) : '';

    if (!safeEqual(provided, expected)) {
      throw new UnauthorizedException('Invalid admin token.');
    }

    return true;
  }
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  // timingSafeEqual throws on length mismatch, so compare lengths separately —
  // the length of a secret is not itself sensitive here.
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
