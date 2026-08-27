import { StrictMode, useEffect, useState } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import './index.css';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '']);

/**
 * Analytics mounts only after hydration has finished. On the first client
 * render this returns null, which is exactly what the prerendered HTML
 * contains — so whatever markup the component injects can never cause a
 * hydration mismatch.
 *
 * It is also skipped on localhost: the script it injects is served by Vercel's
 * edge, so a local `vite preview` would 404 it and log a console error for
 * something that is not actually broken.
 */
function DeferredAnalytics() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || LOCAL_HOSTS.has(window.location.hostname)) return null;
  return <Analytics />;
}

const container = document.getElementById('root');
if (!container) throw new Error('#root is missing from index.html');

const tree = (
  <StrictMode>
    <App />
    <DeferredAnalytics />
  </StrictMode>
);

// The page is prerendered to static HTML at build time (scripts/prerender.mjs),
// so production has markup to hydrate. `npm run dev` has none.
if (container.hasChildNodes()) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
