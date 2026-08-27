# contact-api

Small NestJS service behind [gaurajrakholiya.vercel.app](https://gaurajrakholiya.vercel.app).
Two jobs: deliver messages from the site's contact form, and let me replace my
résumé from any browser without a commit or a redeploy.

It is deliberately small. It is also public, because a portfolio that claims
backend work should have some backend you can actually read.

```
POST /contact      send a message           validated · rate limited · honeypot
GET  /health       liveness + config state
GET  /resume       302 → the current résumé
GET  /resume/meta  what is currently live
POST /resume       replace the résumé       admin token required
```

---

## Design notes

### Validation is total

A global `ValidationPipe` runs with `whitelist` and `forbidNonWhitelisted`, so a
request carrying a property the DTO does not declare is rejected outright rather
than silently stripped. Every field on `CreateContactDto` has an explicit length
or format rule.

### The honeypot returns 200

`CreateContactDto` declares a `website` field that is rendered off-screen and
`aria-hidden` on the site. A human never sees it; a bot fills in everything it
finds. When it arrives non-empty the message is dropped and the response is
`200 {ok: true, delivered: false}`.

Returning an error there would be a mistake: it tells the bot its submission was
detected, which is exactly the feedback needed to work around the check. Silence
is worth more than a correct status code here.

It has to be declared on the DTO at all *because* of `forbidNonWhitelisted` —
an undeclared `website` would be rejected as an unknown property before the
service ever saw it.

### Rate limits: 5 per 10 minutes per IP

High enough that nobody sending a real enquiry will hit it — including someone
who mistypes their address and resends a few times — and low enough that
scripted abuse stops being worth the effort. The résumé endpoint gets 10 per 10
minutes, since a failed upload is something you retry.

### Nothing fails silently

If `RESEND_API_KEY`, `CONTACT_TO_EMAIL` or `CONTACT_FROM_EMAIL` is missing,
`POST /contact` returns **503 with an explanation**. It does not return 200 for
a message that was never going to be delivered. `GET /health` reports
`deliveryConfigured` so you can tell why in one request.

### The admin guard fails closed

`AdminGuard` denies every request when `ADMIN_TOKEN` is unset or shorter than 16
characters, rather than defaulting open. Comparison is `timingSafeEqual`, so the
token cannot be recovered a byte at a time.

### Uploads are validated before configuration is checked

`ResumeService.replace()` checks the file *first* — a bad upload is a 400
whether or not blob storage happens to be wired up. Answering "storage not
configured" to a malformed request would both mislead the caller and reveal
deployment state.

The file must be ≤5MB and must actually start with `%PDF-`. Trusting the
browser's `Content-Type` alone would let anything through with a renamed
extension.

### The résumé link cannot break

`GET /resume` redirects to the uploaded blob if there is one, and otherwise to
`FALLBACK_RESUME_URL` — the copy committed alongside the frontend. So the link
resolves before the first upload, and it resolves if blob storage is down.

### Serverless bootstrap is cached as a promise

`api/index.ts` caches the *promise* returned by `bootstrap()`, not the app. Two
concurrent cold requests therefore share one initialisation instead of racing to
build two. A failed bootstrap clears the cache so the next request retries,
rather than serving 500s until the next deploy.

---

## Running it

```bash
npm install
cp .env.example .env
npm run start:dev      # http://localhost:3001
```

`http://localhost:5173` is permitted by CORS automatically whenever `NODE_ENV`
is not `production`.

### Environment

| Variable | Required for | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | contact form | Without it `POST /contact` is a loud 503. |
| `CONTACT_TO_EMAIL` | contact form | Where enquiries land. |
| `CONTACT_FROM_EMAIL` | contact form | Must be on a domain verified in Resend. |
| `ALLOWED_ORIGIN` | production | Comma-separated origin allowlist. |
| `BLOB_READ_WRITE_TOKEN` | résumé upload | Added automatically when you create a Vercel Blob store. |
| `ADMIN_TOKEN` | résumé upload | ≥16 chars. Generate: `node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"` |
| `FALLBACK_RESUME_URL` | no | Defaults to `<first ALLOWED_ORIGIN>/resume.pdf`. |
| `PORT` | no | Local only; Vercel ignores it. |

### Checking it works

```bash
curl localhost:3001/health

# valid message
curl localhost:3001/contact -H 'Content-Type: application/json' \
  -d '{"name":"Jane Doe","email":"jane@example.com","message":"Hello, about a backend role."}'

# rejected: too short
curl localhost:3001/contact -H 'Content-Type: application/json' \
  -d '{"name":"Jane Doe","email":"jane@example.com","message":"hi"}'

# rejected: unknown property
curl localhost:3001/contact -H 'Content-Type: application/json' \
  -d '{"name":"Jane","email":"j@example.com","message":"long enough message","isAdmin":true}'

# accepted and dropped: honeypot
curl localhost:3001/contact -H 'Content-Type: application/json' \
  -d '{"name":"Bot","email":"b@example.com","message":"buy things now","website":"http://spam"}'

# replace the résumé
curl -X POST localhost:3001/resume \
  -H "Authorization: Bearer $ADMIN_TOKEN" -F "file=@resume.pdf"
```

---

## Deploying

A Vercel project with **Root Directory** set to `backend`. `api/index.ts` is
picked up as a serverless function and `vercel.json` rewrites every path to it.
Create a Blob store on the project for the résumé upload, then set `ADMIN_TOKEN`
and the Resend variables.
