import {
  Controller,
  Get,
  Post,
  Redirect,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { AdminGuard } from '../admin/admin.guard';
import { ResumeService } from './resume.service';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  /**
   * The site's "Download résumé" link points here. It redirects to whichever
   * copy is current — the uploaded one, or the committed fallback — so the
   * link keeps working before the first upload and if blob storage is down.
   */
  @Get()
  @Redirect()
  async download() {
    return { url: await this.resumeService.currentUrl(), statusCode: 302 };
  }

  /** Powers the admin page's "currently live" panel. Public: it leaks nothing. */
  @Get('meta')
  async meta() {
    return this.resumeService.meta();
  }

  /**
   * Replace the résumé. Admin token required.
   *
   * memoryStorage rather than disk: serverless filesystems are ephemeral and
   * read-only outside /tmp, and a 5MB cap makes buffering safe.
   */
  @Post()
  @UseGuards(AdminGuard)
  @Throttle({ default: { limit: 10, ttl: 600_000 } })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.resumeService.replace(file);
  }
}
