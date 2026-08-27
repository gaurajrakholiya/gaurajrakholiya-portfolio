import { useState } from 'react';
import { HERO } from '../data/content';

/**
 * The signature element: a permission matrix that resolves on load.
 *
 * Rows are modules, columns are the four HTTP verbs. Two things matter here:
 *
 * 1. The grant/deny binary is encoded TWICE — colour *and* fill. Granted cells
 *    are solid, denied cells are hollow outlines. Grant (#0A6B4F) and Revert
 *    (#A6321E) differ almost entirely in hue, so for the ~1 in 12 men with a
 *    red/green deficiency colour alone would turn this into undifferentiated
 *    mud. The fill difference carries the whole pattern in greyscale.
 *
 * 2. The state of each cell is derived deterministically from its coordinates,
 *    never randomly. Prerendered HTML and the hydrated client must agree.
 *
 * The grid is decorative: it is aria-hidden, and the same facts appear as real
 * text in the caption beneath it.
 */

const MODULES = [
  'articles',
  'media',
  'users',
  'roles',
  'permissions',
  'schedules',
  'audit-log',
  'sitemap',
  // Rows below this point are hidden at narrow widths — density is what breaks
  // at 375px, not the verb columns.
  'projects',
  'devices',
  'sensors',
  'firmware',
  'backups',
  'migrations',
  'discovery',
  'logs',
] as const;

const VERBS = ['GET', 'POST', 'PATCH', 'DELETE'] as const;

const ROLES = ['owner', 'admin', 'installer', 'editor', 'viewer'] as const;

/** Deterministic hash so server and client render the identical grid. */
function cellState(row: number, col: number) {
  const h = ((row + 1) * 73856093) ^ ((col + 1) * 19349663);
  const n = Math.abs(h % 100);
  // GET is granted broadly; destructive verbs much less so. That gradient is
  // what a real permission matrix looks like, and it reads as structure
  // rather than noise.
  const threshold = [88, 62, 55, 28][col];
  return {
    granted: n < threshold,
    role: ROLES[Math.abs(h) % ROLES.length],
  };
}

export function PermissionMatrix() {
  const [hovered, setHovered] = useState<{ row: number; col: number } | null>(null);

  const caption = hovered
    ? `${MODULES[hovered.row]} · ${VERBS[hovered.col]} · role:${
        cellState(hovered.row, hovered.col).role
      } · ${cellState(hovered.row, hovered.col).granted ? 'granted' : 'denied'}`
    : HERO.matrixCaption;

  return (
    <div className="w-full">
      <div
        aria-hidden="true"
        className="grid grid-cols-[4.5rem_repeat(4,1fr)] gap-x-1.5 gap-y-1 sm:grid-cols-[6.5rem_repeat(4,1fr)] sm:gap-x-2"
        onMouseLeave={() => setHovered(null)}
      >
        {/* Verb header row */}
        <div />
        {VERBS.map((verb) => (
          <div key={verb} className="u-mono pb-2 text-center text-[0.625rem] sm:text-2xs">
            {verb}
          </div>
        ))}

        {MODULES.map((module, row) => (
          <MatrixRow
            key={module}
            module={module}
            row={row}
            hovered={hovered}
            onHover={setHovered}
          />
        ))}
      </div>

      <p className="mt-5 max-w-md font-mono text-2xs leading-relaxed text-graphite">{caption}</p>
    </div>
  );
}

function MatrixRow({
  module,
  row,
  hovered,
  onHover,
}: {
  module: string;
  row: number;
  hovered: { row: number; col: number } | null;
  onHover: (v: { row: number; col: number } | null) => void;
}) {
  // Rows past the eighth are dropped below the sm breakpoint.
  const narrowHidden = row >= 8 ? 'hidden sm:block' : '';

  return (
    <>
      <div
        className={`u-mono self-center truncate text-[0.625rem] normal-case tracking-normal sm:text-2xs ${narrowHidden} ${
          hovered?.row === row ? 'text-ink' : ''
        }`}
      >
        {module}
      </div>
      {VERBS.map((verb, col) => {
        const { granted } = cellState(row, col);
        return (
          <div key={verb} className={narrowHidden}>
            <div
              onMouseEnter={() => onHover({ row, col })}
              className="matrix-cell h-5 w-full sm:h-4"
              data-granted={granted}
              style={{ animationDelay: `${(row * 4 + col) * 11}ms` }}
            />
          </div>
        );
      })}
    </>
  );
}
