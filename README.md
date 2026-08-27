<!--
Paste the contents of this file into a repository named exactly
`GaurajRakholiya` (same as the username). GitHub renders that repo's README on
your profile page.

    gh repo create GaurajRakholiya --public --add-readme
    # then replace its README.md with everything below the line

Do this before publishing the portfolio: the site's hero has a "View GitHub"
button, and a profile with nothing on it undercuts the site rather than
supporting it. Pin `order-assessment-task` and the portfolio repo.
-->

---

## Gauraj Rakholiya

**Backend Developer** · India

I build production backend platforms — hundreds of endpoints, real-time event
layers, row-level access control, and data systems that keep working when nobody
is watching.

Currently at **Vrutti Technologies**, where I maintain the API platforms behind a
production CMS and a real-time building automation product.

### What I work on

| | |
| --- | --- |
| **Backend** | Node.js · NestJS · Express · TypeScript |
| **Databases** | PostgreSQL · MySQL · SQLite · Sequelize |
| **Real-time** | Socket.IO · WebSockets · MQTT |
| **Infrastructure** | Docker · AWS S3 · Google Cloud Storage |

### Things worth reading

**[order-assessment-task](https://github.com/gaurajrakholiya/order-assessment-task)** — CSV ingestion service
that hash-routes orders across three sharded PostgreSQL databases.
`CRC32(order_id) % 3` for O(1) single-shard lookups, parallel scatter-gather for
customer queries, streaming parse so the file never lands in memory. The README
includes an honest account of where the design stops holding — resharding cost,
unpaginated fan-out, no cross-shard transactions.

**[portfolio](https://github.com/GaurajRakholiya/portfolio)** — this site.
Prerendered React, self-hosted fonts with measured metric-matched fallbacks.

### Elsewhere

[gaurajrakholiya.vercel.app](https://gaurajrakholiya.vercel.app) ·
[LinkedIn](https://linkedin.com/in/GaurajRakholiya) ·
[gaurajrakholiya@gmail.com](mailto:gaurajrakholiya@gmail.com)
