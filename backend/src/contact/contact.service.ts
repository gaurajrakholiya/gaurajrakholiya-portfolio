import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  async send(dto: CreateContactDto): Promise<{ ok: true; delivered: boolean }> {
    // Honeypot filled: accept, drop, tell the caller nothing.
    if (dto.website && dto.website.length > 0) {
      this.logger.warn('Honeypot triggered; message discarded');
      return { ok: true, delivered: false };
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO_EMAIL;
    const from = process.env.CONTACT_FROM_EMAIL;

    // No silent black hole: if delivery is not configured, say so loudly rather
    // than returning 200 for a message that was never going anywhere.
    if (!apiKey || !to || !from) {
      this.logger.error(
        'Delivery is not configured (RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL)',
      );
      throw new ServiceUnavailableException(
        'The contact service is not accepting messages right now. Please email me directly.',
      );
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: dto.email,
        subject: `Portfolio enquiry from ${dto.name}`,
        text: this.asPlainText(dto),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      this.logger.error(`Resend rejected the message (${response.status}): ${detail}`);
      throw new ServiceUnavailableException(
        'The message could not be delivered. Please email me directly.',
      );
    }

    this.logger.log(`Message delivered from ${dto.email}`);
    return { ok: true, delivered: true };
  }

  private asPlainText(dto: CreateContactDto): string {
    return [
      `Name:    ${dto.name}`,
      `Email:   ${dto.email}`,
      dto.company ? `Company: ${dto.company}` : null,
      '',
      dto.message,
    ]
      .filter((line): line is string => line !== null)
      .join('\n');
  }
}
