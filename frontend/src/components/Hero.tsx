import { HERO, PROFILE, RESUME_IS_REMOTE } from '../data/content';
import { PermissionMatrix } from './PermissionMatrix';

export function Hero() {
  return (
    <div className="mx-auto max-w-[76rem] px-6 pt-14 pb-16 md:px-10 md:pt-24 md:pb-28">
      <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div className="min-w-0">
          <p className="u-mono">
            {PROFILE.role}
            <span aria-hidden="true" className="px-2 text-hairline">
              /
            </span>
            {PROFILE.location}
          </p>

          {/* Sized with clamp so it can never outgrow the viewport — at 375px a
              fixed 4.5rem forces the whole page into horizontal scroll. CLS is
              handled by preloading this face and giving it a metric-matched
              fallback (see index.css), not by reserving a line box. */}
          <h1 className="mt-5 text-[clamp(2.75rem,10.5vw,6rem)] leading-[0.95] break-words">
            {PROFILE.name}
          </h1>

          <p className="mt-7 max-w-[46ch] text-lg leading-relaxed text-ink sm:text-xl">
            {HERO.positioning}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${PROFILE.email}`}
              className="u-mono flex min-h-11 items-center bg-ink px-5 text-bone transition-colors hover:bg-signal"
            >
              Get in touch
            </a>
            <a
              href={PROFILE.github}
              target="_blank"
              rel="noopener noreferrer"
              className="u-mono flex min-h-11 items-center border border-ink px-5 text-ink transition-colors hover:bg-ink hover:text-bone"
            >
              View GitHub
            </a>
            <a
              href={PROFILE.resume}
              {...(RESUME_IS_REMOTE
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : { download: true })}
              className="u-mono flex min-h-11 items-center px-1 text-graphite underline decoration-hairline underline-offset-4 transition-colors hover:text-ink"
            >
              Download résumé
            </a>
          </div>
        </div>

        <div className="min-w-0 lg:pt-3">
          <PermissionMatrix />
        </div>
      </div>
    </div>
  );
}
