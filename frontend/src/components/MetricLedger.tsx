import type { Metric } from '../data/content';

/**
 * Metrics as a bill-of-materials ledger — key left, dot leader across, value
 * right in mono. Deliberately not the three-across stat strip: this scales to
 * six rows, and it reads like a parts manifest, which is what these numbers
 * actually are.
 */
export function MetricLedger({ metrics, label }: { metrics: readonly Metric[]; label: string }) {
  return (
    <dl aria-label={label} className="mt-8 border-y border-hairline">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="group flex items-baseline gap-3 border-b border-hairline py-2.5 last:border-b-0 sm:gap-4"
        >
          <dt className="u-mono shrink-0 transition-colors group-hover:text-ink">{metric.label}</dt>
          <span
            aria-hidden="true"
            className="min-w-4 flex-1 translate-y-[-0.3rem] border-b border-dotted border-hairline"
          />
          <dd className="shrink-0 font-mono text-lg leading-none tabular-nums sm:text-xl">
            {metric.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
