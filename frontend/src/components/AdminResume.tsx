import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { API_BASE } from '../data/content';

type Meta = {
  exists: boolean;
  url: string | null;
  size: number | null;
  uploadedAt: string | null;
};

type Status =
  | { kind: 'idle' }
  | { kind: 'uploading' }
  | { kind: 'done'; at: string }
  | { kind: 'error'; message: string };

const TOKEN_KEY = 'resume-admin-token';

/**
 * Replace the live résumé from any browser — no commit, no redeploy.
 *
 * The token is held in sessionStorage, not localStorage, so it is gone when the
 * tab closes. It is only ever sent to the API as a bearer header.
 */
export function AdminResume() {
  const [token, setToken] = useState('');
  const [remember, setRemember] = useState(false);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const inputRef = useRef<HTMLInputElement | null>(null);

  const loadMeta = useCallback(async () => {
    if (!API_BASE) return;
    try {
      const response = await fetch(`${API_BASE}/resume/meta`);
      if (response.ok) setMeta((await response.json()) as Meta);
    } catch {
      setMeta(null);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(TOKEN_KEY);
      if (saved) {
        setToken(saved);
        setRemember(true);
      }
    } catch {
      // sessionStorage can throw in private modes; the field just starts empty.
    }
    void loadMeta();
  }, [loadMeta]);

  if (!API_BASE) {
    return (
      <Shell>
        <p className="max-w-[52ch] leading-relaxed">
          This build has no API configured, so there is nothing to upload to. Set{' '}
          <code className="font-mono text-signal">VITE_CONTACT_API_URL</code> on the frontend
          project and redeploy.
        </p>
      </Shell>
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!file || !token || status.kind === 'uploading') return;

    setStatus({ kind: 'uploading' });
    const body = new FormData();
    body.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/resume`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        setStatus({
          kind: 'error',
          message:
            (detail && typeof detail.message === 'string' && detail.message) ||
            `Upload failed with ${response.status}.`,
        });
        return;
      }

      try {
        if (remember) sessionStorage.setItem(TOKEN_KEY, token);
        else sessionStorage.removeItem(TOKEN_KEY);
      } catch {
        // Not being able to remember the token is not an upload failure.
      }

      setStatus({ kind: 'done', at: new Date().toLocaleTimeString() });
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      void loadMeta();
    } catch {
      setStatus({ kind: 'error', message: 'Could not reach the API.' });
    }
  }

  return (
    <Shell>
      <section aria-label="Currently live" className="border-y border-hairline">
        <Row label="Status">
          {meta === null
            ? 'Checking…'
            : meta.exists
              ? 'An uploaded résumé is live'
              : 'No upload yet — serving the copy committed in the repo'}
        </Row>
        <Row label="Updated">
          {meta?.uploadedAt ? new Date(meta.uploadedAt).toLocaleString() : '—'}
        </Row>
        <Row label="Size">{meta?.size ? `${Math.round(meta.size / 1024)} KB` : '—'}</Row>
        <Row label="Live link">
          <a
            href={`${API_BASE}/resume`}
            target="_blank"
            rel="noopener noreferrer"
            className="u-link inline-block py-1 font-mono"
          >
            Open current résumé
          </a>
        </Row>
      </section>

      <form onSubmit={onSubmit} className="mt-10">
        <label htmlFor="admin-token" className="u-mono block">
          Admin token
        </label>
        <input
          id="admin-token"
          type="password"
          autoComplete="current-password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          className="mt-2 h-11 w-full max-w-md border border-hairline bg-paper px-3 font-mono focus:border-signal focus:outline-none"
        />

        <label className="mt-3 flex items-center gap-2.5 text-sm text-graphite">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="size-4 accent-[#1b3fd8]"
          />
          Keep for this tab only
        </label>

        <label htmlFor="admin-file" className="u-mono mt-8 block">
          New résumé (PDF, max 5MB)
        </label>
        <input
          ref={inputRef}
          id="admin-file"
          type="file"
          accept="application/pdf,.pdf"
          required
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setStatus({ kind: 'idle' });
          }}
          className="mt-2 block w-full max-w-md cursor-pointer border border-hairline bg-paper p-2.5 text-sm file:mr-3 file:cursor-pointer file:border-0 file:bg-ink file:px-3 file:py-2 file:font-mono file:text-xs file:text-bone"
        />

        <button
          type="submit"
          disabled={!file || !token || status.kind === 'uploading'}
          className="u-mono mt-8 flex min-h-11 items-center bg-ink px-6 text-bone transition-colors hover:bg-signal disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status.kind === 'uploading' ? 'Uploading…' : 'Replace résumé'}
        </button>

        <div aria-live="polite" className="mt-6">
          {status.kind === 'done' && (
            <p className="border-l-2 border-grant pl-4 leading-relaxed">
              <span className="u-mono block text-grant">Replaced at {status.at}</span>
              The download link on the site now serves this file. Hard-refresh to bypass the
              one-minute cache.
            </p>
          )}
          {status.kind === 'error' && (
            <p className="border-l-2 border-revert pl-4 leading-relaxed">
              <span className="u-mono block text-revert">Not replaced</span>
              {status.message}
            </p>
          )}
        </div>
      </form>
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <p className="u-mono">
        <a href="/" className="hover:text-ink">
          ← Back to site
        </a>
      </p>
      <h1 className="mt-6 text-4xl">Résumé upload</h1>
      <p className="mt-4 max-w-[56ch] leading-relaxed text-graphite">
        Replaces the PDF behind every “Download résumé” link on the site. Takes effect
        immediately — no commit, no redeploy.
      </p>
      <div className="mt-10">{children}</div>
    </main>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-hairline py-3.5 last:border-b-0">
      <span className="u-mono w-24 shrink-0">{label}</span>
      <span className="min-w-0">{children}</span>
    </div>
  );
}
