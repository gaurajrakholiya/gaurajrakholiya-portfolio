import { ABOUT } from '../data/content';

export function About() {
  return (
    <div className="mt-8 max-w-[62ch]">
      {ABOUT.map((paragraph) => (
        <p key={paragraph.slice(0, 40)} className="mt-4 text-lg leading-[1.7] first:mt-0">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
