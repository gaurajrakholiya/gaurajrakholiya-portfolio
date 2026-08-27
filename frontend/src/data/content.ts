/**
 * Single source of truth for every string and every external URL on the page.
 *
 * Nothing here is invented. Every metric and claim traces to source material supplied
 * by Gauraj (resume, project READMEs). If a fact is not in that material, it is not here.
 */

/* ------------------------------------------------------------------ */
/* External links — checked at build time by scripts/check-links.mjs   */
/* ------------------------------------------------------------------ */

/** Public repo for the sharded Orders API. CONFIRM THE REPO NAME before deploying. */
export const ORDERS_API_REPO_URL = 'https://github.com/gaurajrakholiya/order-assessment-task';

/** Public repo for the NestJS contact service that powers this site's contact form. */
export const CONTACT_API_REPO_URL = 'https://github.com/gaurajrakholiya/contact-api';

/** Canonical origin. Update if the deployed domain differs. */
export const SITE_URL = 'https://gaurajrakholiya.vercel.app';

/** Base URL of the NestJS service, without a trailing slash. '' when unset. */
export const API_BASE = (import.meta.env.VITE_CONTACT_API_URL ?? '').replace(/\/$/, '');

/**
 * Where "Download résumé" points.
 *
 * With an API configured this is `GET /resume`, which 302s to whichever copy is
 * current — the one uploaded through /admin, or the PDF committed in this repo
 * if nothing has been uploaded yet. That is what makes the résumé replaceable
 * from any browser without a commit or a redeploy.
 *
 * With no API, it is the committed PDF directly. Either way the link resolves.
 */
export const RESUME_URL = API_BASE ? `${API_BASE}/resume` : '/resume.pdf';

/** A cross-origin `download` attribute is ignored by browsers, so don't claim it. */
export const RESUME_IS_REMOTE = Boolean(API_BASE);

export const PROFILE = {
  name: 'Gauraj Rakholiya',
  role: 'Backend Developer',
  location: 'India',
  email: 'gaurajrakholiya@gmail.com',
  phone: '+91 9510597371',
  phoneHref: '+919510597371',
  github: 'https://github.com/GaurajRakholiya',
  linkedin: 'https://linkedin.com/in/GaurajRakholiya',
  resume: RESUME_URL,
} as const;

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

/**
 * Three positioning lines were written; the first is the one in use.
 *
 *  B. "Backend engineer. I design API surfaces measured in hundreds of endpoints, and
 *      the permission, real-time, and scheduling layers that hold them together."
 *  C. "I build the backend platforms products run on: large REST surfaces, event streams,
 *      permission systems, and jobs that recover on their own."
 *
 * A was chosen because "keep working when nobody is watching" states the actual thesis of
 * the page — correctness under failure — where B and C only describe surface area, which is
 * true of any backend developer.
 */
export const HERO = {
  positioning:
    'I build production backend platforms — hundreds of endpoints, real-time event layers, row-level access control, and data systems that keep working when nobody is watching.',
  matrixCaption:
    'Permission matrix: 38 modules × 5 role tiers × 4 verbs, resolved per request with row-level ownership checks.',
} as const;

/* ------------------------------------------------------------------ */
/* About                                                               */
/* ------------------------------------------------------------------ */

export const ABOUT: readonly string[] = [
  'I am a backend developer at Vrutti Technologies, where I build and maintain the API platforms two products run on.',
  'Most of my work is the unglamorous half of a system: the permission matrix that has to hold across every endpoint, the import that must not half-write, the scheduled job that runs at three in the morning with nobody watching it.',
  'I care more about what a system does when something fails than about how it behaves when everything works — which usually means transactions that roll back cleanly, migrations that can run twice, and updates that can undo themselves.',
  'I also try to be precise about where a design stops holding. The sharding service below ships with its own list of limits, written by me.',
];

/* ------------------------------------------------------------------ */
/* Work                                                                */
/* ------------------------------------------------------------------ */

export type Metric = { label: string; value: string };

export type ProjectLink =
  | { kind: 'repo'; href: string; label: string }
  | { kind: 'proprietary'; note: string };

export type Limitation = { heading: string; body: readonly string[] };

export type Project = {
  id: string;
  index: string;
  title: string;
  type: string;
  company?: string;
  timeline?: string;
  stack: readonly string[];
  summary: string;
  metrics: readonly Metric[];
  highlights: readonly string[];
  challenge: { label: string; problem: string; approach: string };
  link: ProjectLink;
  longForm?: { heading: string; paragraphs: readonly string[] };
  limitations?: { heading: string; intro: string; items: readonly Limitation[] };
  diagram?: 'shard';
};

export const PROJECTS: readonly Project[] = [
  /* ---------------------------------------------------------------- */
  {
    id: 'cms',
    index: '01',
    title: 'Content Management System',
    type: 'Production CMS platform',
    company: 'Vrutti Technologies Pvt. Ltd.',
    stack: ['Node.js', 'TypeScript', 'Express', 'Sequelize', 'MySQL', 'AWS S3', 'Sharp', 'Multer'],
    summary:
      'Production CMS backend powering both a public mobile/web client and an internal admin console.',
    metrics: [
      { label: 'REST endpoints', value: '~708' },
      { label: 'Modules', value: '131' },
      { label: 'Sequelize models', value: '95' },
      { label: 'Content models', value: '30+' },
    ],
    highlights: [
      '~708 REST endpoints across 131 modules and 95 Sequelize/MySQL models, serving a public mobile and web client alongside an internal admin console.',
      'JWT authentication over a role–module–permission RBAC matrix with per-verb row-level scoping, paired with full audit logging of every mutating request — before and after snapshots.',
      'Media pipeline running upload → optimization → CDN delivery: Multer validation, Sharp derivatives, TinyPNG compression, BlurHash placeholders, and dual-bucket AWS S3 storage behind presigned URLs, with libvips concurrency tuned to the host.',
      'Config-driven status engine centralizing publish, unpublish and reject across 30+ content models, replacing the per-module handlers — paired with an automated expiry sweep that retires stale content daily without an editor touching it.',
      'Database-driven cron scheduler whose jobs — YouTube channel sync, daily darshan release, sitemap regeneration, log rotation — are added, retimed or paused at runtime with no redeploy, each with 3-attempt retry and per-run execution logging.',
    ],
    challenge: {
      label: 'Thirty models, ninety copies of the same workflow',
      problem:
        'Publish, unpublish and reject were implemented per module, so the same workflow existed in as many copies as there were content models, with nothing keeping them in agreement.',
      approach:
        'One configuration-driven status engine that owns every transition. A model declares its statuses and legal transitions; enforcement, audit trail and failure behaviour come from a single implementation.',
    },
    longForm: {
      heading: 'The status engine rewrite',
      paragraphs: [
        'The CMS carried more than thirty content models, and every one of them could be published, unpublished, or rejected. Those three transitions were implemented per module — each model holding its own copy of the same workflow.',
        'Three verbs across thirty-odd models is roughly ninety code paths that are all expected to behave identically, with nothing in the system requiring them to. Adding a content type meant writing the workflow again. Changing what publishing *meant* — an extra guard, a new side effect, a different audit entry — meant finding and editing every copy, and being right about having found them all.',
        'I replaced the per-module handlers with a single status engine driven by configuration. A model declares which statuses it has and which transitions between them are legal; the engine owns the transition itself. Every model then gets the same enforcement, the same audit trail and the same failure behaviour because there is one implementation — not because thirty of them are being kept in agreement by hand.',
        'Centralizing transitions also made a second problem tractable. Content that was supposed to stop being public on a given date had no way of getting there on its own; it stayed live until an editor remembered it. Once one component owned status changes, expiry became a scheduled job invoking exactly the same transition an editor would, and stale content began retiring daily without anyone intervening.',
        'It is the change I would point to first if asked what I actually do. It shipped no feature. What it removed was the possibility of thirty implementations quietly drifting apart.',
      ],
    },
    link: {
      kind: 'proprietary',
      note: 'Proprietary — architecture walkthrough available on request.',
    },
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'animeo',
    index: '02',
    title: 'Animeo IP by Somfy',
    type: 'Real-time platform backend',
    company: 'Vrutti Technologies Pvt. Ltd.',
    timeline: 'February 2025 – Present',
    stack: ['NestJS', 'TypeScript', 'Socket.IO', 'MQTT', 'SQLite', 'Docker'],
    summary:
      'NestJS backend for a building automation platform, built around a real-time event layer, a data-driven permission system and a versioned migration engine — deployed as containerized services with automated update and rollback.',
    metrics: [
      { label: 'Socket handlers', value: '104' },
      { label: 'Events', value: '~200' },
      { label: 'Rooms', value: '20' },
      { label: 'RBAC modules', value: '38' },
      { label: 'Permission rows', value: '128' },
      { label: 'Role tiers', value: '5' },
    ],
    highlights: [
      'Real-time event architecture: a Socket.IO gateway with 104 handlers across ~200 events and 20 rooms, room-scoped so each client subscribes only to the streams relevant to it — live positions for the shading motors under control, sensor telemetry, and discovery progress.',
      'Data-driven RBAC: 38 modules, 128 permission rows and 5 role tiers, enforced across ~200 endpoints with row-level ownership checks rather than route-level guards alone.',
      'Versioned migration engine for the embedded SQLite database — 12 schema migrations and 10 data migrations with idempotent seeders — plus transactional project import that takes an automatic backup and restores it if the import fails.',
      'MQTT integration bridging device control into the API layer, with the socket gateway relaying resulting state changes to browser clients as they happen.',
      'Pull-based update distribution with a semver compatibility handshake, automatic update and downgrade, live progress streaming, and rollback via backup-restore.',
      'Containerized with Docker Compose for ARM64 embedded Linux targets, giving dev–production parity and reproducible deployments on field controllers.',
    ],
    challenge: {
      label: 'Updating machines nobody can log into',
      problem:
        'Updates run unattended on controllers in the field. There is no operator at the other end, so a bad update is expensive to recover from — potentially a site visit.',
      approach:
        'Distribution is pull-based rather than push-based, a semver handshake refuses incompatible builds before anything is written, and any failure rolls back to the last-known-good state from its own backup.',
    },
    link: {
      kind: 'proprietary',
      note: 'Proprietary — architecture walkthrough available on request.',
    },
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'orders',
    index: '03',
    title: 'Orders API',
    type: 'Sharded order processing service',
    stack: [
      'Node.js',
      'TypeScript',
      'Express 5',
      'PostgreSQL ×3',
      'Google Cloud Storage',
      'Docker',
      'csv-parser',
      'crc-32',
    ],
    summary:
      'CSV ingestion service that archives raw uploads to Google Cloud Storage, stream-parses and validates them row by row, and hash-routes every order across three horizontally sharded PostgreSQL databases.',
    metrics: [
      { label: 'Shards', value: '3' },
      { label: 'Rows ingested', value: '10,000' },
      { label: 'Insert batch', value: '500' },
      { label: 'Max upload', value: '50MB' },
      { label: 'Lookup by order_id', value: 'O(1)' },
    ],
    diagram: 'shard',
    highlights: [
      'Streaming CSV parse — the file is never fully loaded into memory, so upload size is bounded by the 50MB limit rather than by available heap.',
      'Shard routing computed in-process as CRC32(order_id) % 3: no mapping table, no double write on insert, and no extra network round-trip on read.',
      'Batched multi-row inserts of 500, each wrapped in a per-shard transaction with ON CONFLICT (order_id) DO NOTHING, so re-uploading the same file cannot duplicate orders.',
      'Reads split by access pattern: lookup by order_id hashes straight to one shard, while lookup by customer_id fans out to all three in parallel and merges the results by order date.',
      'Row-level validation before insert — UUID format, parseable ISO timestamp, non-negative amount, status enum — with invalid rows skipped and reported back with reasons rather than failing the upload.',
      'Google Cloud auth via Application Default Credentials, so no service-account key file is ever stored in the repository.',
      'All three PostgreSQL shards run as Docker containers, keeping the setup reproducible on any machine.',
    ],
    challenge: {
      label: 'Choosing the shard key',
      problem:
        'customer_id is the intuitive key — a customer’s orders would live together and every customer query would hit one shard. But one enterprise customer placing 100,000 orders puts all of them on a single shard while the other two sit idle.',
      approach:
        'Shard on order_id instead. It is a UUIDv4, so it is random by construction and CRC32-mod distributes it evenly with no hotspot. The most frequent query in an order system — fetch order X — then resolves to exactly one shard. The accepted cost is that customer queries have to fan out.',
    },
    limitations: {
      heading: 'Limitations & future work',
      intro:
        'The design above is deliberate, but it makes trade-offs that would need revisiting before this ran in production. The significant ones, in my own assessment:',
      items: [
        {
          heading: 'Resharding requires a full data migration',
          body: [
            'CRC32(order_id) % 3 binds the shard count into the routing function. Moving from 3 shards to 4 changes the modulus, which remaps roughly 75% of existing orders — every one of them has to be read, rehashed and moved. There is no way to add capacity incrementally.',
            'Two standard fixes, neither implemented here: consistent hashing, mapping shards onto a hash ring so adding a node only relocates the keys in its arc; or virtual buckets, hashing into a fixed large number of logical buckets (say 1024) and maintaining a bucket → shard assignment map, so adding a shard reassigns a subset of buckets and only that subset’s rows move. Virtual buckets is the approach I would take here — routing stays cheap and the map is small enough to hold in memory.',
          ],
        },
        {
          heading: 'The customer fan-out query has no pagination',
          body: [
            'GET /orders?customerId=X queries all shards in parallel and merges the full result set in application memory. For a customer with a few dozen orders this is fine. For one with 100,000 it is not — the response is unbounded and the merge happens entirely in the API process.',
            'Paginating a scatter-gather query is genuinely harder than paginating a single table, since page boundaries do not align with shard boundaries. The workable approach is keyset pagination on (order_date, order_id): request N rows from each shard past the cursor, merge, return the first N, and carry the last returned key forward. Offset pagination does not work here — OFFSET 1000 means something different on every shard.',
          ],
        },
        {
          heading: 'Cross-shard operations are not supported',
          body: [
            'Each order is self-contained, so single-order writes are safe. Anything spanning shards is not.',
            'There is no distributed transaction: a batch upload touching all three shards commits per shard, so a failure on shard 2 leaves shards 0 and 1 committed. The response reports what succeeded, but the operation is not atomic.',
            'Aggregates — total revenue, counts by status — would require querying every shard and summing in the application; there is no SUM() across the cluster. Joins across shards are not possible at all: a related entity would have to be co-located under the same shard key or denormalized.',
          ],
        },
        {
          heading: 'No shard-level failure handling',
          body: [
            'If one PostgreSQL instance is down, Promise.all() in the fan-out path rejects and the whole query fails — even though two of three shards could have answered. A production version would use Promise.allSettled() and return partial results behind an explicit degraded: true flag, letting callers decide whether partial data is acceptable.',
            'There is also no per-shard replication, so each shard is a single point of failure for its slice of the keyspace.',
          ],
        },
        {
          heading: 'Uploads are not resumable or idempotent at the file level',
          body: [
            'Row-level idempotency is handled by ON CONFLICT (order_id) DO NOTHING, so re-uploading the same CSV will not duplicate orders. But there is no upload record: a request that dies partway through leaves no marker of how far it got, and the client has no way to check status other than re-uploading the whole file. A production version would persist an upload job with a status and per-batch progress.',
          ],
        },
        {
          heading: 'Validation errors are collected unbounded',
          body: [
            'Every invalid row is pushed into an in-memory errors array returned in the response. A malformed 50MB CSV where most rows fail would build a very large array and a very large response body. This should cap at a sample — the first 100, say — plus a total count.',
            'Operationally there are gaps alongside it: connection pools are created at startup with default sizing and no tuning for shard count or expected concurrency; logging is console-only, with no structured logs or request IDs, so tracing one upload through parse → shard → insert is not possible; and there are no metrics on shard distribution in practice — the even-distribution claim rests on the properties of UUIDv4 and CRC32 rather than on measurement of live data.',
          ],
        },
      ],
    },
    link: {
      kind: 'repo',
      href: ORDERS_API_REPO_URL,
      label: 'Read the code on GitHub',
    },
  },
];

/* ------------------------------------------------------------------ */
/* Skills                                                              */
/* ------------------------------------------------------------------ */

export const SKILLS: readonly { group: string; items: readonly string[] }[] = [
  { group: 'Backend', items: ['Node.js', 'NestJS', 'Express', 'TypeScript', 'JavaScript'] },
  { group: 'Databases', items: ['PostgreSQL', 'MySQL', 'SQLite', 'SQL', 'Sequelize'] },
  { group: 'Real-time & messaging', items: ['Socket.IO', 'WebSockets', 'MQTT'] },
  {
    group: 'Infrastructure',
    items: ['Docker', 'Docker Compose', 'AWS S3', 'Google Cloud Storage', 'Git', 'GitHub'],
  },
  { group: 'Languages', items: ['C++', 'C', 'Python', 'Java'] },
  { group: 'Frontend', items: ['React.js', 'Bootstrap'] },
];

/* ------------------------------------------------------------------ */
/* Experience, education, achievements                                 */
/* ------------------------------------------------------------------ */

export const EXPERIENCE: readonly {
  role: string;
  org: string;
  period: string;
  detail: string;
}[] = [
  {
    role: 'Backend Developer',
    org: 'Vrutti Technologies Pvt. Ltd.',
    period: 'February 2025 – Present',
    detail:
      'Building and maintaining the backend platforms behind a production CMS and a real-time building automation product.',
  },
];

export const EDUCATION: readonly {
  qualification: string;
  org: string;
  period: string;
  detail: string;
}[] = [
  {
    qualification: 'B.Tech, Computer Science',
    org: 'L.D.R.P. Institute of Technology',
    period: 'September 2021 – April 2025',
    detail: 'Gandhinagar, Gujarat · CPI 8.34/10',
  },
];

export const ACHIEVEMENTS: readonly string[] = [
  'Finalist — Student Startup and Innovation Policy (SSIP) Hackathon 2023',
  'Programming in Java — NPTEL-Swayam',
];

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export const NAV: readonly { id: string; label: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'skills', label: 'Skills' },
  { id: 'background', label: 'Background' },
  { id: 'contact', label: 'Contact' },
];
