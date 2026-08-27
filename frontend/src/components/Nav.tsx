import { NAV, PROFILE, RESUME_IS_REMOTE } from '../data/content';
import { useActiveSection } from '../hooks/useReveal';

const NAV_IDS = NAV.map((n) => n.id);

export function Nav() {
  const active = useActiveSection(NAV_IDS);

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-bone/92 backdrop-blur-sm">
      <div className="mx-auto max-w-[76rem] px-6 md:px-10">
        <div className="flex h-14 items-center justify-between gap-4 md:h-16">
          <a
            href="#top"
            className="inline-block py-2 font-mono text-xs tracking-[0.12em] whitespace-nowrap text-ink uppercase"
          >
            {PROFILE.name}
          </a>

          <nav aria-label="Sections" className="hidden md:block">
            <ul className="flex items-center gap-7">
              {NAV.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={active === item.id ? 'true' : undefined}
                    className={`u-mono inline-block py-2 transition-colors hover:text-ink ${
                      active === item.id ? 'text-signal' : ''
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <a
            href={PROFILE.resume}
            {...(RESUME_IS_REMOTE
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : { download: true })}
            className="u-mono shrink-0 border border-ink px-3 py-2 text-ink transition-colors hover:bg-ink hover:text-bone"
          >
            Résumé
          </a>
        </div>

        {/* Mobile: anchors on their own scrollable row rather than behind a
            hamburger, so every section stays one tap away. */}
        <nav aria-label="Sections" className="md:hidden">
          <ul className="-mx-6 flex gap-6 overflow-x-auto px-6 pb-3">
            {NAV.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={active === item.id ? 'true' : undefined}
                  className={`u-mono block py-1 whitespace-nowrap ${
                    active === item.id ? 'text-signal' : ''
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
