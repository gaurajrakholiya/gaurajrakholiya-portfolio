import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { head, put } from '@vercel/blob';

/** Fixed pathname so every upload overwrites the previous résumé in place. */
const BLOB_PATH = 'resume.pdf';

const MAX_BYTES = 5 * 1024 * 1024;

export type ResumeMeta = {
  exists: boolean;
  url: string | null;
  size: number | null;
  uploadedAt: string | null;
};

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  private get token(): string | undefined {
    return process.env.BLOB_READ_WRITE_TOKEN;
  }

  /**
   * Where the site's "Download résumé" link should point right now: the
   * uploaded blob if there is one, otherwise the copy committed alongside the
   * frontend. The link is therefore never dead, even before the first upload.
   */
  async currentUrl(): Promise<string> {
    const meta = await this.meta();
    return meta.url ?? this.fallbackUrl();
  }

  async meta(): Promise<ResumeMeta> {
    if (!this.token) {
      return { exists: false, url: null, size: null, uploadedAt: null };
    }

    try {
      const blob = await head(BLOB_PATH, { token: this.token });
      return {
        exists: true,
        url: blob.url,
        size: blob.size,
        uploadedAt: blob.uploadedAt.toISOString(),
      };
    } catch {
      // head() throws BlobNotFoundError when nothing has been uploaded yet.
      // That is an ordinary state, not an error worth surfacing.
      return { exists: false, url: null, size: null, uploadedAt: null };
    }
  }

  async replace(file: Express.Multer.File): Promise<ResumeMeta> {
    // Validate the request before inspecting server configuration. A bad upload
    // is a 400 whether or not storage happens to be wired up, and answering
    // "not configured" first would both mislead the caller and reveal
    // deployment state in response to a malformed request.
    this.assertIsPdf(file);

    if (!this.token) {
      throw new ServiceUnavailableException(
        'Blob storage is not configured (BLOB_READ_WRITE_TOKEN).',
      );
    }

    const blob = await put(BLOB_PATH, file.buffer, {
      access: 'public',
      token: this.token,
      contentType: 'application/pdf',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    });

    this.logger.log(`Résumé replaced (${file.size} bytes)`);

    return {
      exists: true,
      url: blob.url,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };
  }

  /**
   * Trusting the browser's Content-Type would let anything through, so the
   * magic bytes are checked too — a PDF always starts with "%PDF-".
   */
  private assertIsPdf(file: Express.Multer.File): void {
    if (!file?.buffer?.length) {
      throw new BadRequestException('No file was uploaded.');
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('The file is larger than 5MB.');
    }
    if (file.buffer.subarray(0, 5).toString('latin1') !== '%PDF-') {
      throw new BadRequestException('That file is not a PDF.');
    }
  }

  private fallbackUrl(): string {
    if (process.env.FALLBACK_RESUME_URL) return process.env.FALLBACK_RESUME_URL;

    const origin = (process.env.ALLOWED_ORIGIN ?? '').split(',')[0]?.trim();
    return origin ? `${origin.replace(/\/$/, '')}/resume.pdf` : '/resume.pdf';
  }
}
