import type { Project } from '../data/content';
import { Limitations } from './Limitations';
import { MetricLedger } from './MetricLedger';
import { ShardDiagram } from './ShardDiagram';
import { useReveal } from '../hooks/useReveal';

/**
 * A case study, not a card. Each project gets real vertical space: header,
 * stack, summary, ledger, highlights, a challenge → approach callout, and
 * whatever long-form or limitations material it carries.
 */
export function CaseStudy({ project }: { project: Project }) {
  const ref = useReveal<HTMLElement>();

  return (
    <article
      ref={ref}
      id={`project-${project.id}`}
      className="reveal border-t border-hairline pt-10 first:border-t-0 first:pt-0 md:pt-14"
    >
      <header>
        <p className="u-mono">
          <span aria-hidden="true">{project.index}</span>
          <span aria-hidden="true" className="px-2 text-hairline">
            /
          </span>
          {project.type}
        </p>

        <h3 className="mt-3 text-3xl md:text-4xl">{project.title}</h3>

        {(project.company || project.timeline) && (
          <p className="mt-3 text-sm text-graphite">
            {project.company}
            {project.company && project.timeline && (
              <span aria-hidden="true" className="px-2 text-hairline">
                ·
              </span>
            )}
            {project.timeline}
          </p>
        )}
      </header>

      <ul aria-label="Stack" className="mt-5 flex flex-wrap gap-x-2 gap-y-2">
        {project.stack.map((tech) => (
          <li
            key={tech}
            className="border border-hairline px-2.5 py-1 font-mono text-2xs text-graphite"
          >
            {tech}
          </li>
        ))}
      </ul>

      <p className="mt-7 max-w-[62ch] text-lg leading-relaxed">{project.summary}</p>

      <div className="mt-2 grid gap-x-12 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 lg:order-2">
          <MetricLedger metrics={project.metrics} label={`${project.title} — key numbers`} />
          {project.diagram === 'shard' && <ShardDiagram />}
        </div>

        <div className="min-w-0 lg:order-1">
          <ol className="mt-8 space-y-4">
            {project.highlights.map((highlight, i) => (
              <li key={highlight.slice(0, 40)} className="flex gap-4">
                <span aria-hidden="true" className="u-mono w-6 shrink-0 pt-1.5 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="max-w-[64ch] leading-relaxed">{highlight}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <Challenge challenge={project.challenge} />

      {project.longForm && <LongForm longForm={project.longForm} />}

      {project.limitations && (
        <Limitations
          heading={project.limitations.heading}
          intro={project.limitations.intro}
          items={project.limitations.items}
        />
      )}

      <ProjectLinkLine project={project} />
    </article>
  );
}

function Challenge({ challenge }: { challenge: Project['challenge'] }) {
  return (
    <div className="mt-12 border-l-2 border-signal pl-5 sm:pl-7">
      <p className="u-mono text-signal">The hard part</p>
      <h4 className="mt-2 font-display text-2xl leading-tight">{challenge.label}</h4>
      <dl className="mt-4 max-w-[64ch] space-y-3">
        <div>
          <dt className="u-mono">Challenge</dt>
          <dd className="mt-1 leading-relaxed">{challenge.problem}</dd>
        </div>
        <div>
          <dt className="u-mono">Approach</dt>
          <dd className="mt-1 leading-relaxed">{challenge.approach}</dd>
        </div>
      </dl>
    </div>
  );
}

function LongForm({ longForm }: { longForm: NonNullable<Project['longForm']> }) {
  return (
    <section aria-label={longForm.heading} className="mt-12 border-t border-hairline pt-8">
      <h4 className="font-display text-2xl leading-tight sm:text-3xl">{longForm.heading}</h4>
      <div className="mt-5 max-w-[68ch]">
        {longForm.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)} className="mt-4 text-base leading-[1.75] first:mt-0">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

function ProjectLinkLine({ project }: { project: Project }) {
  if (project.link.kind === 'repo') {
    return (
      <p className="mt-10">
        <a
          href={project.link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="u-mono inline-flex min-h-11 items-center border border-ink px-5 text-ink transition-colors hover:bg-ink hover:text-bone"
        >
          {project.link.label}
          <span aria-hidden="true" className="pl-2">
            →
          </span>
        </a>
      </p>
    );
  }

  return (
    <p className="mt-10 border-t border-hairline pt-5 font-mono text-2xs text-graphite">
      {project.link.note}
    </p>
  );
}
