#!/usr/bin/env node
/**
 * scripts/publish-next.js
 * Picks the next eligible draft and either:
 *   - Schedules it (sets status: 'queued', publishOn: <random time in next N hours>)
 *   - Promotes a queued article whose publishOn has passed (status: 'published', updatedAt: now)
 *
 * Spec rules respected:
 *   - 2 articles per week target → script runs from cron every ~3 days
 *   - Random timing → publishOn is jittered within a window
 *   - Week 1 of automation → only schedule articles with partnerLinkCount <= 1
 *   - Failsafe → skip articles whose body is < 800 words ("invalid"), log to .publish-errors.log
 *   - Queue maintenance → warn (do not auto-write) if drafts+queued < 10
 *
 * Optional flags:
 *   --dry-run     Show what would happen, don't write
 *   --force-now   Promote any queued article whose publishOn has passed (no scheduling)
 *
 * Usage:
 *   npm run queue:publish           # normal cron run
 *   node scripts/publish-next.js --dry-run
 */
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const ARTICLES_DIR = path.join(process.cwd(), 'src', 'content', 'articles');
const ERROR_LOG = path.join(process.cwd(), '.publish-errors.log');
const STATE_FILE = path.join(process.cwd(), '.publish-state.json');
const MIN_BODY_WORDS = 800;

const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry-run');
const FORCE_NOW = args.has('--force-now');

function logError(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(ERROR_LOG, line);
  console.error('  ✗', msg);
}

function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { firstPublishAt: null, runs: 0 };
  }
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
  catch { return { firstPublishAt: null, runs: 0 }; }
}

function saveState(s) {
  if (!DRY) fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}

function loadAll() {
  return fs.readdirSync(ARTICLES_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const file = path.join(ARTICLES_DIR, f);
      const raw = fs.readFileSync(file, 'utf8');
      const parsed = matter(raw);
      return {
        file,
        slug: f.replace(/\.md$/, ''),
        data: parsed.data,
        body: parsed.content,
        bodyWords: parsed.content.split(/\s+/).filter(Boolean).length,
      };
    });
}

function writeArticle(a) {
  const out = matter.stringify(a.body, a.data);
  if (!DRY) fs.writeFileSync(a.file, out);
  console.log(`  ✓ wrote ${a.slug}`);
}

// Random publish window: pick the next available Tue/Thu/Sat that's at least
// 2 days out, with a random hour 08:00-19:00 UTC (covers reasonable timezones).
function pickRandomPublishOn() {
  const now = new Date();
  const target = new Date(now.getTime() + (2 + Math.floor(Math.random() * 5)) * 24 * 60 * 60 * 1000);
  // Allowed days: Tue=2, Thu=4, Sat=6
  const allowedDays = [2, 4, 6];
  while (!allowedDays.includes(target.getUTCDay())) {
    target.setUTCDate(target.getUTCDate() + 1);
  }
  target.setUTCHours(8 + Math.floor(Math.random() * 12));   // 08:00-19:59 UTC
  target.setUTCMinutes(Math.floor(Math.random() * 60));
  target.setUTCSeconds(0); target.setUTCMilliseconds(0);
  return target.toISOString();
}

// Rolling automation week (1-indexed) since first scheduled publish.
function automationWeek(state) {
  if (!state.firstPublishAt) return 1;
  const elapsed = Date.now() - new Date(state.firstPublishAt).getTime();
  return Math.max(1, Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000)) + 1);
}

// Backlink budget per spec: week 1 → 1; week 2 → 2; week 3+ → 2 (max).
function maxBacklinksAllowed(week) {
  if (week <= 1) return 1;
  return 2;
}

function main() {
  const state = loadState();
  state.runs += 1;
  const week = automationWeek(state);
  console.log(`\n→ publish-next.js  week=${week}  dry=${DRY}\n`);

  const all = loadAll();
  const drafts = all.filter(a => (a.data.status ?? 'draft') === 'draft');
  const queued = all.filter(a => a.data.status === 'queued');
  const published = all.filter(a => a.data.status === 'published');

  // 1. Promote any queued items whose publishOn has passed
  const now = Date.now();
  let promoted = 0;
  for (const a of queued) {
    const t = a.data.publishOn ? new Date(a.data.publishOn).getTime() : 0;
    if (t > 0 && t <= now) {
      a.data.status = 'published';
      a.data.publishedAt = a.data.publishedAt || new Date().toISOString().slice(0, 10);
      a.data.updatedAt = new Date().toISOString().slice(0, 10);
      delete a.data.publishOn;
      writeArticle(a);
      promoted += 1;
    }
  }
  if (promoted) console.log(`Promoted ${promoted} article(s) from queue → published.`);

  if (FORCE_NOW) {
    saveState(state);
    return;
  }

  // 2. Schedule next draft if queue eligible
  const eligible = drafts
    .filter(a => {
      if (a.bodyWords < MIN_BODY_WORDS) {
        logError(`SKIP ${a.slug}: body has ${a.bodyWords} words (<${MIN_BODY_WORDS})`);
        return false;
      }
      const blc = a.data.partnerLinkCount ?? 0;
      if (blc > maxBacklinksAllowed(week)) {
        console.log(`  · holding ${a.slug} (partnerLinkCount=${blc}, week=${week} allows ≤${maxBacklinksAllowed(week)})`);
        return false;
      }
      return true;
    });

  // Diversify across clusters: avoid scheduling two from the same cluster back-to-back.
  const recentlyPublished = published
    .sort((a, b) => String(b.data.publishedAt).localeCompare(String(a.data.publishedAt)))
    .slice(0, 2)
    .map(a => a.data.cluster);

  const sorted = eligible.sort((a, b) => {
    const aCluster = recentlyPublished.includes(a.data.cluster) ? 1 : 0;
    const bCluster = recentlyPublished.includes(b.data.cluster) ? 1 : 0;
    if (aCluster !== bCluster) return aCluster - bCluster; // less-recent cluster first
    if (a.data.isPillar && !b.data.isPillar) return -1;     // pillars first
    if (!a.data.isPillar && b.data.isPillar) return 1;
    return a.slug.localeCompare(b.slug);
  });

  const next = sorted[0];
  if (!next) {
    console.log('No eligible draft to schedule this run.');
  } else {
    next.data.status = 'queued';
    next.data.publishOn = pickRandomPublishOn();
    if (!state.firstPublishAt) state.firstPublishAt = new Date().toISOString();
    console.log(`Scheduling: ${next.slug}`);
    console.log(`  publishOn = ${next.data.publishOn}`);
    console.log(`  cluster   = ${next.data.cluster}  pillar=${!!next.data.isPillar}  partnerLinks=${next.data.partnerLinkCount ?? 0}`);
    writeArticle(next);
  }

  // 3. Queue health warning
  const remainingDrafts = drafts.length - (next ? 1 : 0);
  const queueDepth = remainingDrafts + queued.length;
  if (queueDepth < 10) {
    console.log(`\n⚠ queue depth ${queueDepth} < 10 — write more drafts.`);
  } else {
    console.log(`\nqueue depth: ${queueDepth} (ok)`);
  }

  saveState(state);
}

try { main(); }
catch (e) { logError(`FATAL: ${e.stack || e.message}`); process.exit(1); }
