import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  /**
   * 5 messages per IP per 10 minutes. High enough that nobody sending a genuine
   * enquiry will ever see it — including someone who mistypes their address and
   * resends a few times — and low enough that scripted abuse stops being worth
   * the effort.
   */
  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  @Post()
  @HttpCode(200)
  async create(@Body() dto: CreateContactDto) {
    return this.contactService.send(dto);
  }
}
