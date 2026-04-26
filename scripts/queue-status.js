#!/usr/bin/env node
/**
 * scripts/queue-status.js
 * Reports on the publication queue state.
 *
 * Reads frontmatter from every .md file in src/content/articles/
 * and groups them by status: published, queued, draft.
 *
 * Usage:  npm run queue:status
 */
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const ARTICLES_DIR = path.join(process.cwd(), 'src', 'content', 'articles');

function loadAll() {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs.readdirSync(ARTICLES_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const raw = fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf8');
      const parsed = matter(raw);
      return {
        slug: f.replace(/\.md$/, ''),
        data: parsed.data,
        bodyLength: parsed.content.split(/\s+/).filter(Boolean).length,
      };
    });
}

function main() {
  const all = loadAll();
  const byStatus = { published: [], queued: [], draft: [] };
  for (const a of all) {
    const s = a.data.status ?? 'draft';
    (byStatus[s] || byStatus.draft).push(a);
  }

  const fmt = (a) => `  ${a.slug.padEnd(50)} ${String(a.bodyLength).padStart(5)}w  cluster=${a.data.cluster}${a.data.publishOn ? ` publishOn=${a.data.publishOn}` : ''}`;

  console.log('═'.repeat(74));
  console.log(`Queue status — ${all.length} articles total`);
  console.log('═'.repeat(74));
  console.log(`\nPUBLISHED (${byStatus.published.length})`);
  byStatus.published.sort((a,b)=>String(b.data.publishedAt).localeCompare(String(a.data.publishedAt))).forEach(a => console.log(fmt(a)));

  console.log(`\nQUEUED (${byStatus.queued.length}) — scheduled for auto-publish`);
  byStatus.queued.sort((a,b)=>String(a.data.publishOn||'').localeCompare(String(b.data.publishOn||''))).forEach(a => console.log(fmt(a)));

  console.log(`\nDRAFTS (${byStatus.draft.length})`);
  byStatus.draft.forEach(a => console.log(fmt(a)));

  // Health check
  const stubCount = byStatus.draft.filter(a => a.bodyLength < 800).length;
  const queueHealth = byStatus.draft.length + byStatus.queued.length;
  console.log('\n' + '─'.repeat(74));
  console.log(`Health:`);
  console.log(`  Drafts + queued: ${queueHealth}  ${queueHealth >= 10 ? '✓ above 10' : '⚠ below 10 — fill queue'}`);
  console.log(`  Stub drafts (<800 words): ${stubCount}`);
  console.log(`  Published: ${byStatus.published.length}`);
}

main();
