import type { Limitation } from '../data/content';

/**
 * Six independent <details>, never one wrapper around the whole section.
 *
 * The headings are the signal and stay visible at all times — a reader who
 * never clicks anything still comes away with "resharding needs a full
 * migration, fan-out has no pagination, there are no cross-shard
 * transactions". The prose underneath is the detail, and that is what
 * collapses.
 */
export function Limitations({
  heading,
  intro,
  items,
}: {
  heading: string;
  intro: string;
  items: readonly Limitation[];
}) {
  return (
    <section aria-label={heading} className="mt-12 border border-hairline bg-paper p-6 sm:p-8">
      <h4 className="font-mono text-xs tracking-[0.1em] text-ink uppercase">{heading}</h4>
      <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-graphite">{intro}</p>

      <div className="mt-6 border-t border-hairline">
        {items.map((item, i) => (
          <details key={item.heading} className="group border-b border-hairline">
            <summary className="flex cursor-pointer list-none items-baseline gap-3 py-3.5 transition-colors hover:text-signal">
              <span className="u-mono shrink-0 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="flex-1 text-base leading-snug font-medium">{item.heading}</span>
              <span
                aria-hidden="true"
                className="shrink-0 font-mono text-sm text-graphite transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="pb-5 pl-0 sm:pl-11">
              {item.body.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="mt-3 max-w-[70ch] text-sm leading-relaxed text-graphite first:mt-0"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
