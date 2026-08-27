import { PROFILE } from '../data/content';

export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-[76rem] flex-wrap items-center justify-between gap-4 px-6 py-8 md:px-10">
        <p className="u-mono">
          {PROFILE.name}
          <span aria-hidden="true" className="px-2 text-hairline">
            /
          </span>
          {PROFILE.role}
        </p>
        <p className="u-mono">
          <a href="#top" className="inline-block py-2 hover:text-ink">
            Back to top ↑
          </a>
        </p>
      </div>
    </footer>
  );
}
