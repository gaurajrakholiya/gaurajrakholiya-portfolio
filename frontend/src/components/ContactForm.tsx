import { useState } from 'react';
import type { FormEvent, InputHTMLAttributes } from 'react';
import { PROFILE } from '../data/content';

/**
 * Rendered only when VITE_CONTACT_API_URL is set at build time — see Contact.tsx.
 * There is no state in which a visible form silently discards a message: every
 * failure path surfaces the reason and hands the visitor a prefilled mailto
 * link carrying what they already typed.
 */

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'sent' }
  | { kind: 'failed'; reason: string };

const API_URL = import.meta.env.VITE_CONTACT_API_URL as string;

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === 'submitting') return;

    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus({ kind: 'submitting' });

    try {
      const response = await fetch(`${API_URL.replace(/\/$/, '')}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(data.get('name') ?? ''),
          email: String(data.get('email') ?? ''),
          company: String(data.get('company') ?? ''),
          message: String(data.get('message') ?? ''),
          website: String(data.get('website') ?? ''),
        }),
      });

      if (response.ok) {
        setStatus({ kind: 'sent' });
        form.reset();
        setMessage('');
        setName('');
        return;
      }

      const body = await response.json().catch(() => null);
      setStatus({
        kind: 'failed',
        reason: readError(body) ?? `The service responded with ${response.status}.`,
      });
    } catch {
      setStatus({
        kind: 'failed',
        reason: 'The message could not be sent — the service may be unreachable.',
      });
    }
  }

  if (status.kind === 'sent') {
    return (
      <div className="mt-8 border border-grant bg-paper p-6" role="status">
        <p className="u-mono text-grant">Message sent</p>
        <p className="mt-2 max-w-[52ch] leading-relaxed">
          Thanks — it landed in my inbox and I&apos;ll reply to the address you gave.
        </p>
      </div>
    );
  }

  const busy = status.kind === 'submitting';

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-xl" noValidate={false}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Name"
          name="name"
          autoComplete="name"
          required
          minLength={2}
          maxLength={80}
          value={name}
          onChange={setName}
        />
        <Field label="Email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="mt-5">
        <Field label="Company" name="company" autoComplete="organization" optional />
      </div>

      <div className="mt-5">
        <label htmlFor="contact-message" className="u-mono block">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-2 w-full resize-y border border-hairline bg-paper px-3 py-2.5 leading-relaxed focus:border-signal focus:outline-none"
        />
        <p className="u-mono mt-1.5 tabular-nums">{message.length} / 2000</p>
      </div>

      {/* Honeypot. Real people never fill this in; bots fill everything. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="u-mono flex min-h-11 items-center bg-ink px-6 text-bone transition-colors hover:bg-signal disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Sending…' : 'Send message'}
        </button>
        <a
          href={`mailto:${PROFILE.email}`}
          className="u-mono text-graphite underline decoration-hairline underline-offset-4 hover:text-ink"
        >
          or just email me
        </a>
      </div>

      {status.kind === 'failed' && (
        <div className="mt-6 border-l-2 border-revert pl-4" role="alert">
          <p className="u-mono text-revert">Not sent</p>
          <p className="mt-1.5 max-w-[52ch] text-sm leading-relaxed">{status.reason}</p>
          <p className="mt-2 text-sm">
            <a
              className="u-link"
              href={`mailto:${PROFILE.email}?subject=${encodeURIComponent(
                `Portfolio enquiry${name ? ` from ${name}` : ''}`,
              )}&body=${encodeURIComponent(message)}`}
            >
              Send it as an email instead
            </a>{' '}
            — your message is already in the draft.
          </p>
        </div>
      )}
    </form>
  );
}

function readError(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const message = (body as { message?: unknown }).message;
  if (typeof message === 'string') return message;
  if (Array.isArray(message) && typeof message[0] === 'string') return message.join(' ');
  return null;
}

function Field({
  label,
  name,
  type = 'text',
  optional = false,
  value,
  onChange,
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  optional?: boolean;
  value?: string;
  onChange?: (v: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'name' | 'type'>) {
  const id = `contact-${name}`;
  return (
    <div>
      <label htmlFor={id} className="u-mono block">
        {label}
        {optional && <span className="pl-2 normal-case">(optional)</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        {...(onChange ? { value: value ?? '', onChange: (e) => onChange(e.target.value) } : {})}
        {...rest}
        className="mt-2 h-11 w-full border border-hairline bg-paper px-3 focus:border-signal focus:outline-none"
      />
    </div>
  );
}
