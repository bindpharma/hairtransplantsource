#!/usr/bin/env node
/**
 * scripts/seo-audit.js
 * Static SEO audit across all articles. Run before deploys.
 *
 * Checks:
 *   - Required frontmatter fields present
 *   - metaTitle ≤ 60 chars, metaDescription ≤ 155 chars
 *   - FAQ count between 6 and 10
 *   - Body word count between 1200 and 1800 (warn outside this range)
 *   - Quick answer between 30 and 80 words
 *   - Primary keyword appears in title and meta description
 *   - Cannibalization: no two articles share the same primaryKeyword
 *   - Partner-link distribution roughly 50/30/20 across published+queued
 *   - Internal-link sanity: every linked slug exists
 *
 * Exit code 0 = pass, 1 = errors found.
 *
 * Usage:  npm run seo:audit
 */
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const ARTICLES_DIR = path.join(process.cwd(), 'src', 'content', 'articles');

function load() {
  return fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md')).map(f => {
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf8');
    const { data, content } = matter(raw);
    return { slug: f.replace(/\.md$/, ''), data, body: content };
  });
}

function wordCount(s) { return s.split(/\s+/).filter(Boolean).length; }

function main() {
  const articles = load();
  const slugs = new Set(articles.map(a => a.slug));
  const errors = [];
  const warnings = [];
  const required = ['title', 'metaTitle', 'metaDescription', 'cluster', 'primaryKeyword', 'quickAnswer', 'author', 'publishedAt', 'status', 'faq'];

  // 1. Per-article checks
  for (const a of articles) {
    const tag = `[${a.slug}]`;
    for (const k of required) {
      if (a.data[k] === undefined || a.data[k] === null || a.data[k] === '') errors.push(`${tag} missing field: ${k}`);
    }
    if ((a.data.metaTitle || '').length > 60) errors.push(`${tag} metaTitle ${a.data.metaTitle.length} > 60`);
    if ((a.data.metaDescription || '').length > 155) errors.push(`${tag} metaDescription ${a.data.metaDescription.length} > 155`);
    const faqLen = (a.data.faq || []).length;
    if (faqLen < 6 || faqLen > 10) errors.push(`${tag} FAQ length ${faqLen}, must be 6–10`);
    const qaWords = wordCount(a.data.quickAnswer || '');
    if (qaWords < 30 || qaWords > 80) warnings.push(`${tag} quickAnswer is ${qaWords} words (target 40–60)`);

    if (a.data.status === 'published') {
      const bw = wordCount(a.body);
      if (bw < 1200) errors.push(`${tag} published body ${bw}w < 1200`);
      if (bw > 1800) warnings.push(`${tag} published body ${bw}w > 1800`);

      const pk = (a.data.primaryKeyword || '').toLowerCase();
      const titleLc = (a.data.title || '').toLowerCase();
      const descLc = (a.data.metaDescription || '').toLowerCase();
      if (pk && !titleLc.includes(pk.split(' ').slice(0, 2).join(' '))) warnings.push(`${tag} title may not contain primary keyword`);
      if (pk && !descLc.includes(pk.split(' ').slice(0, 2).join(' '))) warnings.push(`${tag} meta description may not contain primary keyword`);
    }

    for (const sl of (a.data.internalLinks || [])) {
      if (!slugs.has(sl)) warnings.push(`${tag} internalLink '${sl}' does not exist on disk`);
    }
  }

  // 2. Cannibalization — no shared primary keyword
  const byPK = {};
  for (const a of articles) {
    const k = (a.data.primaryKeyword || '').toLowerCase().trim();
    if (!k) continue;
    (byPK[k] ||= []).push(a.slug);
  }
  for (const [k, list] of Object.entries(byPK)) {
    if (list.length > 1) errors.push(`cannibalization: primaryKeyword "${k}" used by ${list.length} articles → ${list.join(', ')}`);
  }

  // 3. Partner-link distribution across published + queued
  const live = articles.filter(a => a.data.status === 'published' || a.data.status === 'queued');
  const counts = { 0: 0, 1: 0, 2: 0 };
  for (const a of live) counts[a.data.partnerLinkCount ?? 0] += 1;
  const total = Math.max(1, live.length);
  const pct = { 0: counts[0] / total, 1: counts[1] / total, 2: counts[2] / total };
  // Warn if drift > 10pp from spec (50/30/20)
  if (Math.abs(pct[0] - 0.5) > 0.1) warnings.push(`partner-link distribution: ${(pct[0]*100).toFixed(0)}% with no link (target 50%)`);
  if (Math.abs(pct[1] - 0.3) > 0.1) warnings.push(`partner-link distribution: ${(pct[1]*100).toFixed(0)}% with 1 link (target 30%)`);
  if (Math.abs(pct[2] - 0.2) > 0.1) warnings.push(`partner-link distribution: ${(pct[2]*100).toFixed(0)}% with 2 links (target 20%)`);

  // Output
  console.log(`\nSEO audit — ${articles.length} articles, ${live.length} live`);
  console.log('═'.repeat(74));
  if (warnings.length) { console.log(`\nWarnings (${warnings.length}):`); warnings.forEach(w => console.log('  · ' + w)); }
  if (errors.length)   { console.log(`\nErrors (${errors.length}):`);     errors.forEach(e => console.log('  ✗ ' + e)); }
  if (!warnings.length && !errors.length) console.log('All checks passed.');
  process.exit(errors.length ? 1 : 0);
}

main();
