#!/usr/bin/env node
/**
 * automation/seo-optimization-loop.js
 * Weekly content optimisation cycle (run from cron every 7 days).
 *
 * Reads analytics from .analytics/ and produces a prioritised work list:
 *   - Top 5 pages → flag for expansion (add FAQ, internal links, longer body)
 *   - Pages with high impressions but no published improvements in 60+ days → flag for review
 *   - Pages flagged with status='published' but body <1200 words → flag as urgent expand
 *   - Pages with no internal inbound links → flag as orphan
 *   - Pages older than 180 days with no traffic → propose noindex
 *
 * Output: .seo-tasks.json (machine readable) and console table.
 *
 * Usage:  npm run seo:loop
 */
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const ARTICLES_DIR = path.join(process.cwd(), 'src', 'content', 'articles');
const ANALYTICS_DIR = path.join(process.cwd(), '.analytics');
const TASKS_FILE = path.join(process.cwd(), '.seo-tasks.json');

function loadArticles() {
  return fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md')).map(f => {
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf8');
    const { data, content } = matter(raw);
    return { slug: f.replace(/\.md$/, ''), file: path.join(ARTICLES_DIR, f), data, body: content, words: content.split(/\s+/).filter(Boolean).length };
  });
}

function loadAnalytics(days = 30) {
  if (!fs.existsSync(ANALYTICS_DIR)) return [];
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const events = [];
  for (const f of fs.readdirSync(ANALYTICS_DIR).filter(f => f.endsWith('.jsonl'))) {
    const lines = fs.readFileSync(path.join(ANALYTICS_DIR, f), 'utf8').split('\n');
    for (const ln of lines) {
      if (!ln) continue;
      try {
        const e = JSON.parse(ln);
        if (e.ts >= cutoff) events.push(e);
      } catch {}
    }
  }
  return events;
}

function buildIndex(articles) {
  // Map slug → inbound link count
  const inbound = {};
  for (const a of articles) {
    for (const sl of (a.data.internalLinks || [])) {
      inbound[sl] = (inbound[sl] || 0) + 1;
    }
  }
  return inbound;
}

function pageviewsBySlug(events, articles) {
  const pv = {};
  for (const a of articles) pv[a.slug] = 0;
  for (const e of events) {
    const m = (e.p || '').match(/^\/articles\/([^/?#]+)/);
    if (m) pv[m[1]] = (pv[m[1]] || 0) + 1;
  }
  return pv;
}

function daysSince(iso) {
  if (!iso) return Infinity;
  return Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
}

function main() {
  const articles = loadArticles();
  const events = loadAnalytics(30);
  const pv = pageviewsBySlug(events, articles);
  const inbound = buildIndex(articles);

  const tasks = [];

  // Top 5 by pageviews → expand
  const topByTraffic = articles
    .filter(a => a.data.status === 'published')
    .sort((a, b) => (pv[b.slug] || 0) - (pv[a.slug] || 0))
    .slice(0, 5);

  for (const a of topByTraffic) {
    if ((pv[a.slug] || 0) === 0) continue;
    tasks.push({
      slug: a.slug, type: 'expand', priority: 'high',
      reason: `top traffic (${pv[a.slug]} views/30d)`,
      actions: [
        a.data.faq && a.data.faq.length < 9 ? 'add 1–2 FAQ items targeting long-tail variants' : null,
        a.words < 1500 ? `expand body from ${a.words} → 1500+ words` : null,
        (inbound[a.slug] || 0) < 3 ? 'add 1–2 inbound links from sibling articles' : null,
      ].filter(Boolean),
    });
  }

  // Stale published with low traffic → review/noindex
  for (const a of articles) {
    if (a.data.status !== 'published') continue;
    const age = daysSince(a.data.updatedAt);
    if (age > 180 && (pv[a.slug] || 0) < 5) {
      tasks.push({
        slug: a.slug, type: 'review', priority: 'medium',
        reason: `${age} days stale, ${pv[a.slug] || 0} views/30d`,
        actions: ['rewrite & re-date, or set noindex: true'],
      });
    }
  }

  // Published but body too short → urgent expand
  for (const a of articles) {
    if (a.data.status === 'published' && a.words < 1200) {
      tasks.push({
        slug: a.slug, type: 'expand-urgent', priority: 'high',
        reason: `published with body ${a.words}w (<1200 spec)`,
        actions: [`expand to 1200–1800 body words`],
      });
    }
  }

  // Orphan pages (no inbound internal links)
  for (const a of articles) {
    if (a.data.status !== 'published') continue;
    if ((inbound[a.slug] || 0) === 0) {
      tasks.push({
        slug: a.slug, type: 'orphan', priority: 'medium',
        reason: 'no inbound internal links',
        actions: ['add internal links from same-cluster articles'],
      });
    }
  }

  // Sort by priority
  const order = { high: 0, medium: 1, low: 2 };
  tasks.sort((a, b) => order[a.priority] - order[b.priority]);

  // Output
  console.log(`\nSEO optimisation loop — ${tasks.length} task(s) generated`);
  console.log('═'.repeat(74));
  if (!tasks.length) {
    console.log('No tasks. All published articles are current.');
  } else {
    for (const t of tasks) {
      console.log(`\n[${t.priority.toUpperCase()}]  ${t.slug}  (${t.type})`);
      console.log(`  reason:  ${t.reason}`);
      for (const a of t.actions) console.log(`  → ${a}`);
    }
  }

  fs.writeFileSync(TASKS_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), tasks }, null, 2));
  console.log(`\nTasks written to ${TASKS_FILE}`);
}

main();
