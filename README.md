# Hair Transplant Source

Independent authority platform on hair transplant training, PRP, mesotherapy, FUE & DHI.
Production-ready Next.js 14 codebase with built-in publishing queue, SEO audit,
weekly optimisation loop, and cookieless analytics.

---

## ⚠️ Read this first

This repository contains a complete **technical platform**. Before going live you must:

1. **Replace the placeholder author profiles in `src/data/authors.ts`** with real,
   verifiable, credentialed contributors who have agreed in writing to be named on
   medical content. The four entries shipped with this repo (Dr. Emre Kaya,
   Dr. Leyla Arslan, Mert Özdemir, and the editorial team) are scaffolding —
   not real people. Publishing medical content under fabricated bylines is a legal,
   regulatory and Google E-E-A-T problem you do not want.
2. **Have a credentialed clinician review the 3 launch articles.** They are
   technically accurate to the best of an editorial researcher's knowledge but they
   were not written by a practising hair restoration surgeon. A surgeon needs to
   sign off before they are presented to readers as reviewed clinical content.
3. **Write the 27 stub articles.** They exist on disk as drafts with full
   frontmatter and the spec brief in a comment block at the top. The publishing
   queue will refuse to schedule them until each body reaches 800 words. The
   1200–1800 word target lives in the SEO audit.

Everything else — routing, schema, analytics, queue, watermarking, sitemap, RSS,
GitHub Actions, deployment — is built and wired.

---

## What's here

```
.
├── src/
│   ├── app/                           Next.js App Router pages
│   │   ├── page.tsx                   Homepage
│   │   ├── articles/[slug]/page.tsx   Article detail
│   │   ├── articles/page.tsx          All-articles index
│   │   ├── [cluster]/page.tsx         Cluster pages (5)
│   │   ├── about/, methodology/,      Trust pages
│   │   │   contact/, privacy/,
│   │   │   disclosure/
│   │   ├── dashboard/                 First-party analytics UI
│   │   ├── api/track/route.ts         Analytics ingestion endpoint
│   │   ├── api/analytics/route.ts     Analytics summary (bearer-auth)
│   │   ├── sitemap.xml/route.ts       Dynamic sitemap
│   │   ├── rss.xml/route.ts           RSS feed
│   │   └── robots.txt/route.ts        robots.txt
│   ├── components/                    UI (Header, Footer, ArticleLayout,
│   │                                  QuickAnswer, FAQBlock, AuthorBio,
│   │                                  RelatedArticles, PartnerCallout)
│   ├── content/articles/              Markdown articles (3 published, 27 drafts)
│   ├── data/
│   │   ├── article-plan.json          Master plan, source of truth
│   │   ├── article-plan.ts            Typed re-export
│   │   └── authors.ts                 Editorial team (REPLACE BEFORE LAUNCH)
│   └── lib/                           site config, article loader, SEO helpers
├── scripts/
│   ├── queue-status.js                Snapshot of queue state
│   ├── publish-next.js                Schedule + promote articles
│   ├── fill-queue.js                  Generate stubs from the plan
│   ├── watermark-images.js            Sharp pipeline → WebP w/ watermark
│   └── seo-audit.js                   Pre-deploy lint
├── automation/
│   └── seo-optimization-loop.js       Weekly worklist generator
├── .github/workflows/
│   ├── publish.yml                    Daily promote + Tue/Fri schedule
│   ├── optimize.yml                   Mon weekly SEO loop
│   └── audit.yml                      Per-PR SEO audit
└── public/                            Logo, favicon, image outputs
```

---

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev          # http://localhost:3000
```

You should see the homepage with three clusters populated and three articles live.

### Production build

```bash
npm run build
npm start
```

---

## How publishing works

The queue rules from the original spec are enforced at the script level, not in
the cron schedule. This makes the cadence reproducible across re-deploys.

| Spec rule                            | Where it's enforced                                              |
|--------------------------------------|------------------------------------------------------------------|
| Launch with homepage + 3 articles    | The 3 launch articles are `status: published`, others are drafts |
| 2 articles per week                  | `publish.yml` cron: Tue + Fri full runs                          |
| Random timing                        | `pickRandomPublishOn()` — 2–5 days ahead, weekday, 08–17 UTC     |
| Maintain 10 drafts                   | `queue-status.js` warns; never auto-writes content               |
| Week 1 → max 1 backlink              | `maxBacklinksAllowed(week)` — week 1: 1, week 2+: 2              |
| Failsafe: skip invalid, log errors   | `MIN_BODY_WORDS = 800`, errors → `.publish-errors.log`           |
| Index control: noindex weak pages    | Frontmatter `noindex: true` → robots meta + excluded from sitemap |
| One keyword per page                 | `seo-audit.js` flags shared `primaryKeyword` as cannibalization   |

### Lifecycle of an article

```
[stub on disk]  status: draft   body < 800w  → cannot be scheduled
       ↓ (writer fills body, runs queue:publish)
[scheduled]     status: queued  publishOn: <random weekday 2–5d ahead>
       ↓ (daily promotion cron, when publishOn ≤ now)
[live]          status: published   updatedAt: <today>
```

### Manual operations

```bash
npm run queue:status       # what's published / queued / drafted
npm run queue:fill         # create stub .md files for any plan items missing on disk
npm run queue:publish      # one scheduling run (same as Tue/Fri cron)
npm run queue:publish -- --dry-run        # preview without writing
npm run queue:publish -- --force-now      # promote-only (same as daily cron)

npm run seo:audit          # runs in CI on every PR; run locally pre-commit
npm run seo:loop           # 7-day worklist generator; run weekly

npm run images:watermark   # process anything in public/images/_source/
```

---

## Editorial workflow

When you (or a writer) are ready to add a new article:

1. Open `src/content/articles/<slug>.md` (the stub already exists).
2. Replace the `[Quick answer (40–60 words) — to be written.]` placeholder.
3. Replace the `[In-short summary — to be written.]` placeholder.
4. Replace each `[Answer to be written.]` in the FAQ array.
5. Write the body — 1200–1800 words, including at least one comparison table
   and 3+ internal links to related articles.
6. Add 2–4 source images to `public/images/_source/` with keyword filenames,
   then run `npm run images:watermark`.
7. Run `npm run seo:audit` to lint frontmatter.
8. Have a credentialed reviewer set in `reviewedBy` confirm the content.
9. Commit and push. The next cron run will schedule it; or run
   `npm run queue:publish` to schedule immediately.

The article does **not** flip to `status: published` automatically when you save
the file. It moves to `queued` first, with a `publishOn` date 2–5 weekdays ahead,
and only goes live when the daily promotion cron runs after that timestamp.

---

## Bind Pharma backlink rule

Distribution is enforced at the plan level (`src/data/article-plan.json`):

| partnerLinkCount | Articles | Spec target |
|------------------|----------|-------------|
| 0 (no link)      | 15       | 15 (50%)    |
| 1 (one link)     | 9        | 9 (30%)     |
| 2 (two links)    | 6        | 6 (20%)     |

When `partnerLinkCount >= 1`, the `<PartnerCallout>` component renders one
labelled, `rel="nofollow"` outbound link in a clearly-marked box. When
`partnerLinkCount = 2`, the article body adds one additional contextual mention
inline — already done in the three published launch articles; do the same for
any new two-link article.

Anchor text is varied (the partner is referred to by company name in callouts,
sometimes by sub-brand in body). The audit script does not enforce anchor
diversity automatically — review on each article.

---

## Analytics

The site ships with a **first-party, cookieless** analytics beacon (`/api/track`)
and a dashboard (`/dashboard`).

- Records: pathname, referrer, screen size, browser language, country (from
  edge headers, not from IP).
- Honours `Do Not Track`.
- Logs to `.analytics/<YYYY-MM-DD>.jsonl`. **This works on a single
  long-running server.** For Vercel/Netlify serverless you must replace the
  filesystem write with a KV write (Vercel KV or Upstash Redis). See
  `src/app/api/track/route.ts` — only the `fs.appendFileSync` line needs to
  change.
- The dashboard is open by default. Set `ANALYTICS_TOKEN` in env to require
  a bearer token on `/api/analytics`.

The weekly SEO loop pulls from this endpoint to generate the optimisation
worklist. If you swap to a third-party analytics provider, you only need to
update `loadAnalytics()` in `automation/seo-optimization-loop.js`.

---

## Deployment

### Vercel (recommended)

1. Connect the repo.
2. Set environment variables from `.env.example`.
3. **Important**: replace the filesystem analytics writer with a KV write.
   Quick setup:
   ```bash
   npx vercel env add KV_REST_API_URL
   npx vercel env add KV_REST_API_TOKEN
   ```
   Then in `src/app/api/track/route.ts`, replace the `fs.appendFileSync`
   block with a `kv.lpush(\`events:${todayKey()}\`, JSON.stringify(event))`
   call. The summary endpoint loads the same key.
4. Add a deploy hook (Project → Settings → Git → Deploy Hooks). Copy the URL
   to `DEPLOY_HOOK_URL` GitHub secret so the publish cron can trigger redeploys.

### Self-hosted / Docker

The repo runs cleanly on any Node 20+ host. The filesystem analytics work
out of the box. Set up `pm2` or `systemd` to keep `npm start` running.

### GitHub Actions secrets you need

| Secret              | Purpose                                                          |
|---------------------|------------------------------------------------------------------|
| `DEPLOY_HOOK_URL`   | Optional — triggers redeploy after publish-cron commits          |
| `ANALYTICS_TOKEN`   | Optional — bearer for `/api/analytics` if you set the env var    |

---

## What is NOT included

- **Auto-generated article bodies.** Hair restoration is YMYL. Bodies need
  human authors and named medical reviewers. The platform will refuse to
  schedule any article whose body is below the word floor.
- **Real author photos.** Avatar paths exist in `authors.ts` but the UI uses
  initials in coloured circles by default. Add real photos when you replace
  the placeholder bylines.
- **Source images.** Drop your own into `public/images/_source/` with keyword
  filenames (`fue-training-course.jpg`) and run `npm run images:watermark`.
  Outputs land in `public/images/articles/` as compressed WebP with the site
  watermark bottom-right.
- **A CMS.** Articles are markdown files in the repo. If you want a CMS
  layer, point any flat-file CMS (Decap, TinaCMS, Keystatic) at
  `src/content/articles/`.

---

## Specification compliance — what was delivered vs. what was caveated

| Spec section                       | Status                                                            |
|------------------------------------|-------------------------------------------------------------------|
| Architecture (homepage, clusters, articles, trust pages) | Built |
| 30-article plan with keywords, clusters, partner-link distribution | Built (`article-plan.json`) |
| 3 launch articles fully written (1200–1800 words) | Built (1346 / 1328 / 1358 body words) |
| 27 supporting articles | Stubs with frontmatter; bodies require human authors |
| Templates (Quick answer, FAQ, In short, schema, meta, slug) | Built and validated |
| E-E-A-T (author bios, expertise tone, reviewer attribution) | Built; **placeholder authors must be replaced** |
| Featured snippet optimisation | Built (Quick answer + In short blocks, FAQ schema) |
| Image SEO (WebP, compressed, watermark, keyword filename) | Built (`watermark-images.js`); user supplies sources |
| Bind Pharma backlink rule (50/30/20) | Built; verified at plan level |
| 30-day automation (publish, queue, week rules) | Built (`publish-next.js` + `publish.yml`) |
| Analytics (visitors, sources, pages, country, device, dashboard) | Built |
| Optimisation loop (top pages, FAQ, internal links, every 7 days) | Built (`optimize.yml`) |
| Failsafe (retry/skip/log) | Built (`.publish-errors.log`, dry-run, force-now) |
| Index control (noindex weak pages) | Built (frontmatter flag, sitemap excludes) |
| Cannibalisation control (one keyword per page) | Built (`seo-audit.js` errors on duplicates) |

---

## License & disclaimers

Code: MIT.
Editorial content: do not republish without permission.
Nothing on the site is medical advice.
