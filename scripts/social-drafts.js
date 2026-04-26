#!/usr/bin/env node
/**
 * scripts/social-drafts.js
 * For each newly-published article, generate ready-to-paste social media drafts:
 *   - LinkedIn (longer, doctor/clinic-owner targeted)
 *   - Twitter/X (short, hook-first)
 *   - Generic short version (for WhatsApp groups, Slack, etc.)
 *
 * Drafts are written to .social-drafts/<slug>.md so the human team can copy
 * them into each platform manually. We DO NOT auto-post — auto-posted social
 * is downranked by every major platform's algorithm and reduces reach.
 *
 * Hooks are derived deterministically from the article's quickAnswer + title,
 * so drafts are stable across reruns.
 *
 * Usage:  npm run social:drafts
 */
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const ARTICLES_DIR = path.join(process.cwd(), 'src', 'content', 'articles');
const OUT_DIR = path.join(process.cwd(), '.social-drafts');
const STATE_FILE = path.join(process.cwd(), '.social-drafts-state.json');
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hairtransplantsource.com';

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function loadState() {
  if (!fs.existsSync(STATE_FILE)) return { generated: {} };
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { return { generated: {} }; }
}

function saveState(s) { fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2)); }

function pullStat(quickAnswer) {
  // Find a number/percentage/duration in the quickAnswer for hook reuse.
  const m = quickAnswer.match(/(\d+\s*(?:to|–|-)\s*\d+\s*(?:hours?|days?|weeks?|months?|grafts?|sessions?|percent|%))/i)
        || quickAnswer.match(/(\d+\s*(?:hours?|days?|weeks?|months?|grafts?|sessions?|percent|%))/i)
        || quickAnswer.match(/(€\d[\d,]*[–-]?€?\d*[\d,]*)/);
  return m ? m[1] : null;
}

function makeLinkedIn(article, url) {
  const stat = pullStat(article.quickAnswer);
  const hookLines = [
    stat
      ? `${stat}. That's the figure most ${article.cluster.includes('clinic') || article.cluster.includes('team') ? 'clinic owners' : 'doctors'} get wrong about ${article.primaryKeyword}.`
      : `Most ${article.cluster.includes('clinic') ? 'clinic owners' : 'doctors'} get this wrong about ${article.primaryKeyword}.`,
    article.inShort || article.metaDescription,
    '',
    `New on Hair Transplant Source: ${article.title}`,
    '',
    `Read: ${url}`,
    '',
    `#hairtransplant #${article.cluster.replace(/-/g, '')} #medicaltraining`,
  ];
  return hookLines.join('\n');
}

function makeTwitter(article, url) {
  const stat = pullStat(article.quickAnswer);
  const hook = stat
    ? `${stat} — what most clinics miss about ${article.primaryKeyword}.`
    : `What most clinics miss about ${article.primaryKeyword}.`;
  const lines = [
    hook,
    '',
    `→ ${url}`,
  ];
  return lines.join('\n');
}

function makeShort(article, url) {
  return `${article.title} — ${article.metaDescription} ${url}`;
}

function loadPublished() {
  return fs.readdirSync(ARTICLES_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const raw = fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf8');
      const { data } = matter(raw);
      return { slug: f.replace(/\.md$/, ''), ...data };
    })
    .filter(a => a.status === 'published' && !a.noindex);
}

function main() {
  const state = loadState();
  const articles = loadPublished();
  let made = 0;

  for (const a of articles) {
    if (state.generated[a.slug]) continue;
    const url = `${SITE_URL}/articles/${a.slug}`;
    const out = path.join(OUT_DIR, `${a.slug}.md`);

    const body = `# Social drafts: ${a.title}

URL: ${url}

---

## LinkedIn (~150–200 words, doctor/clinic-owner targeted)

${makeLinkedIn(a, url)}

---

## Twitter/X (short)

${makeTwitter(a, url)}

---

## Short (WhatsApp / Slack / DM)

${makeShort(a, url)}

---

## Posting notes

- Best LinkedIn time for medical audience: Tue/Wed 09:00–11:00 local time
- Add 1–2 of your own sentences before pasting — algorithms downrank pure-template posts
- Tag 1–2 colleagues who might find it useful (genuine, not spam)
- Reply to first 3 comments within 1 hour to boost reach
`;

    fs.writeFileSync(out, body);
    state.generated[a.slug] = new Date().toISOString();
    console.log(`  ✓ .social-drafts/${a.slug}.md`);
    made += 1;
  }

  saveState(state);
  if (!made) console.log('No new articles to draft.');
  else console.log(`\nGenerated ${made} draft set(s). Open .social-drafts/ to copy.`);
}

main();
