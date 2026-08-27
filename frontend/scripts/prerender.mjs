import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const htmlPath = resolve(root, 'dist/index.html');
const serverEntry = resolve(root, 'dist-ssr/entry-server.js');

const { render } = await import(pathToFileURL(serverEntry).href);
const appHtml = render();

const html = readFileSync(htmlPath, 'utf8');
const marker = '<div id="root"></div>';

if (!html.includes(marker)) {
  throw new Error(`prerender: could not find ${marker} in dist/index.html`);
}

writeFileSync(htmlPath, html.replace(marker, `<div id="root">${appHtml}</div>`), 'utf8');

// The SSR bundle is a build artifact only — it must not be deployed.
rmSync(resolve(root, 'dist-ssr'), { recursive: true, force: true });

console.log(`prerender: injected ${appHtml.length.toLocaleString()} chars into dist/index.html`);
