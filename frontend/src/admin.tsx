import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AdminResume } from './components/AdminResume';
import './index.css';

/**
 * Separate Vite entry rather than a route: the site has no router, and keeping
 * the admin page out of the main bundle means visitors never download it.
 * It is noindex'd and disallowed in robots.txt.
 */
const container = document.getElementById('root');
if (!container) throw new Error('#root is missing from admin.html');

createRoot(container).render(
  <StrictMode>
    <AdminResume />
  </StrictMode>,
);
