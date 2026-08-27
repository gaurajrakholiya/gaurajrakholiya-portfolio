/**
 * Fails the build if any external URL on the site is empty, malformed, or still
 * a placeholder. The site's whole argument depends on its one real project link
 * actually resolving — a dead "Read the code" link is worse than no link.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(
  resolve(import.meta.dirname, '../src/data/content.ts'),
  'utf8',
);

const REQUIRED = [
  'ORDERS_API_REPO_URL',
  'CONTACT_API_REPO_URL',
  'SITE_URL',
];

const PLACEHOLDER = /REPLACE|TODO|CHANGEME|example\.com|your-|xxx/i;

const problems = [];

for (const name of REQUIRED) {
  const match = source.match(new RegExp(`export const ${name} = '([^']*)'`));

  if (!match) {
    problems.push(`${name} is not exported from src/data/content.ts`);
    continue;
  }

  const value = match[1].trim();

  if (!value) {
    problems.push(`${name} is empty`);
    continue;
  }
  if (PLACEHOLDER.test(value)) {
    problems.push(`${name} still looks like a placeholder: ${value}`);
    continue;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') {
      problems.push(`${name} is not https: ${value}`);
    }
  } catch {
    problems.push(`${name} is not a valid URL: ${value}`);
  }
}

// Nothing on the page may link to nowhere.
for (const dead of source.matchAll(/href:\s*'(#|)'/g)) {
  problems.push(`dead href found: ${dead[0]}`);
}

if (problems.length > 0) {
  console.error('\n  Link check failed:\n');
  for (const problem of problems) console.error(`   - ${problem}`);
  console.error('\n  Fix these in frontend/src/data/content.ts before building.\n');
  process.exit(1);
}

console.log('check-links: all external URLs present and well-formed');

/**
 * Opt-in reachability check: `CHECK_LINKS_ONLINE=1 npm run build`.
 *
 * Deliberately not part of every build — making a deploy depend on GitHub being
 * reachable would turn a network blip into a failed release. Run it manually
 * before publishing to catch a repo that is still private or does not exist.
 */
if (process.env.CHECK_LINKS_ONLINE === '1') {
  const urls = REQUIRED.map((name) => {
    const match = source.match(new RegExp(`export const ${name} = '([^']*)'`));
    return { name, url: match?.[1] ?? '' };
  }).filter((entry) => entry.url);

  const unreachable = [];

  await Promise.all(
    urls.map(async ({ name, url }) => {
      try {
        const response = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          signal: AbortSignal.timeout(15_000),
        });
        if (!response.ok) unreachable.push(`${name} → ${response.status} ${url}`);
      } catch (error) {
        unreachable.push(`${name} → unreachable (${error.message}) ${url}`);
      }
    }),
  );

  if (unreachable.length > 0) {
    console.error('\n  Reachability check failed:\n');
    for (const entry of unreachable) console.error(`   - ${entry}`);
    console.error('\n  A 404 usually means the repository is private or not created yet.\n');
    // Set the code rather than calling process.exit(): forcing exit while
    // undici still holds open sockets trips a libuv assertion on Windows and
    // reports 127 instead of 1.
    process.exitCode = 1;
  } else {
    console.log('check-links: all external URLs reachable');
  }
}
