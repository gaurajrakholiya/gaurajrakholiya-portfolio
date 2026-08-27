# gaurajrakholiya.com — portfolio

Personal site for **Gauraj Rakholiya**, backend developer. One page, three case
studies, and a small NestJS service behind the contact form and the résumé upload.

Two folders, two independent Vercel projects. There is no workspace root
`package.json` on purpose — that keeps Vercel's zero-config detection working
for each one separately.

```
frontend/   React 19 + Vite + TypeScript + Tailwind v4  →  the site
backend/    NestJS 11                                    →  contact + résumé API
```

---

## Local development

```bash
# the site
cd frontend
npm install
npm run dev            # http://localhost:5173

# the API (separate terminal)
cd backend
npm install
cp .env.example .env   # fill in the values you need
npm run start:dev      # http://localhost:3001
```

To run the site against the local API, put this in `frontend/.env.local`:

```
VITE_CONTACT_API_URL=http://localhost:3001
```

`http://localhost:5173` is allowed by the API's CORS automatically whenever
`NODE_ENV` is not `production`, so nothing else needs configuring.

### Building

```bash
cd frontend && npm run build && npm run preview
```

`npm run build` does four things:

1. `scripts/check-links.mjs` — fails the build if any external URL is empty,
   non-https, or still a placeholder. A dead "Read the code" link would
   undercut the whole point of the site, so it is a build error, not a warning.

   Before publishing, also run the reachability check:

   ```bash
   CHECK_LINKS_ONLINE=1 npm run build
   ```

   It requests each external URL and fails on anything that does not return
   200 — which is how you catch a repo that is still private or not created
   yet. It is opt-in rather than automatic because a routine deploy should not
   fail just because GitHub had a blip.
2. `tsc -b` — typecheck.
3. `vite build` — two entries, `index.html` and `admin.html`.
4. `scripts/prerender.mjs` — renders the page to static HTML and injects it into
   `dist/index.html`, then deletes the SSR bundle.

The prerender step is why the site is a real HTML document rather than an empty
`<div id="root">`: crawlers get content without executing JavaScript, and first
paint does not wait on the bundle.

---

## Deploying

Two Vercel projects from this one repository.

### 1. Frontend

| Setting | Value |
| --- | --- |
| Root Directory | `frontend` |
| Framework preset | Vite |
| Build command | `npm run build` (default) |
| Output directory | `dist` (default) |

Environment variables:

| Name | Required | Purpose |
| --- | --- | --- |
| `VITE_CONTACT_API_URL` | no | Base URL of the backend project. **Leave unset** to ship a mailto-only contact section and disable the résumé upload page. |

### 2. Backend

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Framework preset | Other |

Environment variables are documented in [`backend/.env.example`](backend/.env.example)
and explained in [`backend/README.md`](backend/README.md).

Once both are deployed, set `VITE_CONTACT_API_URL` on the frontend to the
backend's URL and redeploy the frontend.

---

## Replacing the résumé without a deploy

Visit **`/admin`** on the deployed site, enter the admin token, pick a PDF.
Every "Download résumé" link on the site points at `GET /resume` on the API,
which redirects to whichever copy is current — so the change is live
immediately, with no commit and no redeploy.

Before the first upload (or if blob storage is unavailable) that redirect falls
back to `frontend/public/resume.pdf`, the copy committed in this repository. The
link therefore cannot break.

The page is `noindex`'d and disallowed in `robots.txt`, and it ships as its own
Vite entry so its code is never downloaded by ordinary visitors.

---

## Notes on the build

**Fonts are self-hosted.** All five faces (Instrument Serif; IBM Plex Sans 400/600;
IBM Plex Mono 400/500) live in `frontend/public/fonts`, so the page makes no
third-party requests. Each has a metric-matched fallback in `index.css` whose
`size-adjust` / `ascent-override` values were measured from the actual font
files with fontTools rather than estimated — that is what keeps a font swap from
shifting the `<h1>`, which is the element CLS is scored against.

**Colour is never the only channel.** In the hero permission matrix, granted
cells are solid and denied cells are hollow outlines. Grant (`#0A6B4F`) and
Revert (`#A6321E`) differ almost entirely in hue, so for a viewer with a
red/green colour deficiency the fill difference is what carries the pattern. The
same rule applies anywhere that pair is used.

**All content is in one file.** `frontend/src/data/content.ts` holds every string
and every external URL on the page. Nothing in it is invented — every metric
traces to source material.

---

## Before going public

- [ ] **Confirm `ORDERS_API_REPO_URL`** in `frontend/src/data/content.ts`. It
      currently assumes `github.com/GaurajRakholiya/orders`.
- [ ] **Make the linked repos public** — `orders` and `contact-api`. The hero's
      "View GitHub" button is only worth having if what it lands on backs up the
      site.
- [ ] **Publish `profile-README.md`** to `github.com/GaurajRakholiya/GaurajRakholiya`
      so the profile pins the same three projects.
- [ ] **Replace `frontend/public/resume.pdf`** — the committed copy was generated
      from the résumé content and is used as the fallback. Upload your own
      designed PDF through `/admin`, or commit it over this one. Note the
      committed copy predates the Orders API project and does not mention it.
- [ ] **Update the canonical URL** in `frontend/index.html`, `SITE_URL` in
      `content.ts`, `robots.txt` and `sitemap.xml` if the domain differs from
      `gaurajrakholiya.vercel.app`.
- [ ] **Clear the metrics with Vrutti.** The ~708-endpoint figure, the Animeo /
      Somfy details, and the CMS narrative are all client work. Confirm what you
      are allowed to say publicly before publishing.
- [ ] Deepen the status-engine essay (`longForm` on the CMS project). It is
      written only as far as the source material supports; see the six open
      questions in the build plan.
