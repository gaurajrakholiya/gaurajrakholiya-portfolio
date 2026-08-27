import type { ReactNode } from 'react';
import { ACHIEVEMENTS, EDUCATION, EXPERIENCE } from '../data/content';

/** Experience and education in one combined, compact timeline. */
export function Background() {
  return (
    <div className="mt-10">
      <Group title="Experience">
        {EXPERIENCE.map((item) => (
          <Entry
            key={item.role + item.org}
            primary={item.role}
            secondary={item.org}
            period={item.period}
            detail={item.detail}
          />
        ))}
      </Group>

      <Group title="Education">
        {EDUCATION.map((item) => (
          <Entry
            key={item.qualification}
            primary={item.qualification}
            secondary={item.org}
            period={item.period}
            detail={item.detail}
          />
        ))}
      </Group>

      <Group title="Achievements">
        <ul className="space-y-2 py-4">
          {ACHIEVEMENTS.map((achievement) => (
            <li key={achievement} className="flex gap-3 leading-relaxed">
              <span aria-hidden="true" className="text-hairline">
                —
              </span>
              <span>{achievement}</span>
            </li>
          ))}
        </ul>
      </Group>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="border-t border-hairline py-5 last:border-b">
      <h3 className="u-mono">{title}</h3>
      <div className="mt-1">{children}</div>
    </section>
  );
}

function Entry({
  primary,
  secondary,
  period,
  detail,
}: {
  primary: string;
  secondary: string;
  period: string;
  detail: string;
}) {
  return (
    <div className="py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="text-lg">
          {primary}
          <span aria-hidden="true" className="px-2 text-hairline">
            ·
          </span>
          <span className="text-graphite">{secondary}</span>
        </p>
        <p className="u-mono shrink-0">{period}</p>
      </div>
      <p className="mt-1 max-w-[62ch] text-sm leading-relaxed text-graphite">{detail}</p>
    </div>
  );
}
