import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

/**
 * Build-time prerender entry. The site is a single static page, so rendering
 * it to HTML at build time costs one extra build step and buys real markup for
 * crawlers, a meaningful first paint, and a page that reads fine with JS
 * disabled — none of which a bare Vite SPA gives you.
 */
export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
