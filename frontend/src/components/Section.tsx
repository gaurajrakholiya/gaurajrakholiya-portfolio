import type { ReactNode } from 'react';
import { useReveal } from '../hooks/useReveal';

/**
 * The spec-sheet grid: a narrow monospace metadata rail on the left, prose on
 * the right. Below 900px the rail collapses into an inline kicker above the
 * body and the page becomes a single column.
 */
export function Section({
  id,
  index,
  label,
  children,
  className = '',
}: {
  id: string;
  index: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={`border-t border-hairline ${className}`}>
      <div className="mx-auto grid max-w-[76rem] gap-y-6 px-6 py-16 md:grid-cols-[10rem_1fr] md:gap-x-12 md:px-10 md:py-24 lg:grid-cols-[12rem_1fr]">
        <div className="u-mono md:sticky md:top-28 md:self-start">
          <span aria-hidden="true">{index}</span>
          <span aria-hidden="true" className="px-2 text-hairline">
            /
          </span>
          <span>{label}</span>
        </div>
        <div ref={ref} className="reveal min-w-0">
          {children}
        </div>
      </div>
    </section>
  );
}

/** Section heading. Every section has exactly one; the page has exactly one h1. */
export function SectionHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="text-3xl md:text-4xl">
      {children}
    </h2>
  );
}
