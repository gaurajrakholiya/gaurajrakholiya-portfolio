import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { head, issueSignedToken, presignUrl, put } from '@vercel/blob';

/** Fixed pathname so every upload overwrites the previous résumé in place. */
const BLOB_PATH = 'resume.pdf';

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * How long a presigned download URL stays valid.
 *
 * The URL is handed out as a 302 that the browser follows immediately, so this
 * only has to outlive one redirect. Short is the point: anyone who copies the
 * address out of their download manager gets a link that stops working, which
 * is the property a private store is chosen for.
 */
const SIGNED_URL_TTL_MS = 5 * 60 * 1000;

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
    const token = this.token;
    if (!token) return this.fallbackUrl();

    try {
      // head() confirms an upload exists. Presigning does not check, so without
      // this a store that has never been written to would hand out a valid
      // signature for a missing object and 404 the visitor instead of falling
      // back to the committed PDF.
      await head(BLOB_PATH, { token });
    } catch {
      return this.fallbackUrl();
    }

    try {
      return await this.signedUrl(token);
    } catch (error) {
      // Signing is a live call to the Blob control API. If it is down, serving
      // the committed copy beats serving a broken link.
      this.logger.error(
        `Could not presign the résumé URL: ${error instanceof Error ? error.message : String(error)}`,
      );
      return this.fallbackUrl();
    }
  }

  async meta(): Promise<ResumeMeta> {
    if (!this.token) {
      return { exists: false, url: null, size: null, uploadedAt: null };
    }

    try {
      const blob = await head(BLOB_PATH, { token: this.token });
      return {
        exists: true,
        // Deliberately null. A blob in a private store has no durable URL, and
        // this endpoint is public and unauthenticated — minting a signed URL
        // here would let anyone mint them in a loop. Callers link to
        // `GET /resume`, which signs one per request.
        url: null,
        size: blob.size,
        uploadedAt: blob.uploadedAt.toISOString(),
      };
    } catch {
      // head() throws BlobNotFoundError when nothing has been uploaded yet.
      // That is an ordinary state, not an error worth surfacing.
      return { exists: false, url: null, size: null, uploadedAt: null };
    }
  }

  /**
   * Mints a short-lived GET URL for the résumé.
   *
   * Two steps by design: `issueSignedToken` asks the control API for delegation
   * material scoped to this one pathname and operation, and `presignUrl` turns
   * that into a CDN URL. The delegation is the ceiling — a URL cannot outlive
   * it — so the scope is set once, here.
   */
  private async signedUrl(token: string): Promise<string> {
    const validUntil = Date.now() + SIGNED_URL_TTL_MS;

    const signed = await issueSignedToken({
      pathname: BLOB_PATH,
      operations: ['get'],
      validUntil,
      token,
    });

    const { presignedUrl } = await presignUrl(signed, {
      operation: 'get',
      pathname: BLOB_PATH,
      validUntil,
      access: 'private',
    });

    return presignedUrl;
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

    await put(BLOB_PATH, file.buffer, {
      // Must match how the store itself is configured. Sending 'public' to a
      // private store is rejected outright — that is the BlobError this
      // replaced.
      access: 'private',
      token: this.token,
      contentType: 'application/pdf',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    });

    this.logger.log(`Résumé replaced (${file.size} bytes)`);

    return {
      exists: true,
      // See meta(): a private blob has no durable URL. `GET /resume` signs one.
      url: null,
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
