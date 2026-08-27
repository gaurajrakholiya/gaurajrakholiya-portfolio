import { useState } from 'react';
import type { ReactNode } from 'react';
import { API_BASE, CONTACT_API_REPO_URL, PROFILE } from '../data/content';
import { ContactForm } from './ContactForm';

const HAS_CONTACT_API = Boolean(API_BASE);

export function Contact() {
  return (
    <div className="mt-10">
      <p className="max-w-[52ch] text-lg leading-relaxed">
        I&apos;m open to backend and platform engineering roles. The fastest way to reach me is
        email.
      </p>

      <div className="mt-8 border-t border-hairline">
        <Row label="Email">
          <CopyableEmail />
        </Row>
        <Row label="Phone">
          <a href={`tel:${PROFILE.phoneHref}`} className="u-link inline-block py-1 font-mono">
            {PROFILE.phone}
          </a>
        </Row>
        <Row label="GitHub">
          <a
            href={PROFILE.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Gauraj Rakholiya on GitHub (opens in a new tab)"
            className="u-link inline-block py-1 font-mono"
          >
            github.com/GaurajRakholiya
          </a>
        </Row>
        <Row label="LinkedIn">
          <a
            href={PROFILE.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Gauraj Rakholiya on LinkedIn (opens in a new tab)"
            className="u-link inline-block py-1 font-mono"
          >
            linkedin.com/in/GaurajRakholiya
          </a>
        </Row>
      </div>

      {HAS_CONTACT_API ? (
        <>
          <ContactForm />
          <p className="mt-6 max-w-[58ch] font-mono text-2xs leading-relaxed text-graphite">
            This form posts to a small NestJS service — validated DTO, rate limiting, honeypot,
            deployed as a serverless function.{' '}
            <a
              href={CONTACT_API_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="u-link"
            >
              The code is here
            </a>
            .
          </p>
        </>
      ) : (
        <p className="mt-8 max-w-[58ch] font-mono text-2xs leading-relaxed text-graphite">
          No contact form here on purpose — a form that posts nowhere is worse than none. Email goes
          straight to me.
        </p>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-hairline py-4">
      <span className="u-mono w-24 shrink-0">{label}</span>
      <span className="min-w-0 break-all">{children}</span>
    </div>
  );
}

function CopyableEmail() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
    } catch {
      // Clipboard API can be unavailable or refused; fall back to selecting
      // the text so the visitor can copy it by hand.
      const range = document.createRange();
      const node = document.getElementById('contact-email-address');
      if (node) {
        range.selectNodeContents(node);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-4 gap-y-1">
      <a id="contact-email-address" href={`mailto:${PROFILE.email}`} className="u-link inline-block py-1 font-mono">
        {PROFILE.email}
      </a>
      <button
        type="button"
        onClick={copy}
        className="u-mono border border-hairline px-2 py-1 transition-colors hover:border-ink hover:text-ink"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? 'Email address copied to clipboard' : ''}
      </span>
    </span>
  );
}
