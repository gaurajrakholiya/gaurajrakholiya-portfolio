import { SKILLS } from '../data/content';

/**
 * Grouped by role, never a flat cloud, and with no proficiency bars —
 * nobody believes "React 87%".
 */
export function Skills() {
  return (
    <div className="mt-10 border-t border-hairline">
      {SKILLS.map((group) => (
        <div
          key={group.group}
          className="grid gap-x-8 gap-y-3 border-b border-hairline py-5 sm:grid-cols-[11rem_1fr]"
        >
          <h3 className="u-mono pt-1">{group.group}</h3>
          <ul className="flex flex-wrap gap-x-2 gap-y-2">
            {group.items.map((item) => (
              <li
                key={item}
                className="border border-hairline bg-paper px-2.5 py-1 font-mono text-xs text-ink"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
