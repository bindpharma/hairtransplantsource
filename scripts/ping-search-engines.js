#!/usr/bin/env node
/**
 * scripts/ping-search-engines.js
 * After a publish-cron run promotes articles, ping IndexNow (Bing, Yandex,
 * and now-supporting search engines) to crawl the URLs immediately.
 *
 * Google Search Console no longer accepts URL-level pings; sitemap submission
 * is the official path there. We submit the sitemap URL as a ping anyway
 * (idempotent if not supported).
 *
 * IndexNow requires a key file at /<key>.txt on the root domain. We use a
 * deterministic key derived from the SITE.url so it survives redeploys.
 *
 * Usage:  npm run seo:ping
 */
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const crypto = require('node:crypto');

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hairtransplantsource.com';
const HOST = new URL(SITE_URL).hostname;
const ARTICLES_DIR = path.join(process.cwd(), 'src', 'content', 'articles');
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const STATE_FILE = path.join(process.cwd(), '.ping-state.json');

function indexNowKey() {
  // Stable key derived from domain. Survives redeploys; can be rotated by
  // changing SITE.url. Stored at /public/<key>.txt for IndexNow verification.
  return crypto.createHash('sha256').update(HOST).digest('hex').slice(0, 32);
}

function ensureKeyFile() {
  const key = indexNowKey();
  const file = path.join(PUBLIC_DIR, `${key}.txt`);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, key);
    console.log(`  wrote IndexNow key file: public/${key}.txt`);
  }
  return key;
}

function loadState() {
  if (!fs.existsSync(STATE_FILE)) return { lastSeen: {} };
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
  catch { return { lastSeen: {} }; }
}

function saveState(s) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}

function publishedArticles() {
  return fs.readdirSync(ARTICLES_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const raw = fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf8');
      const { data } = matter(raw);
      return { slug: f.replace(/\.md$/, ''), data };
    })
    .filter(a => a.data.status === 'published' && !a.data.noindex);
}

async function pingIndexNow(urls, key) {
  if (!urls.length) return;
  const body = {
    host: HOST,
    key,
    keyLocation: `${SITE_URL}/${key}.txt`,
    urlList: urls,
  };
  try {
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });
    console.log(`  IndexNow → ${res.status} (${urls.length} URL${urls.length === 1 ? '' : 's'})`);
  } catch (e) {
    console.error(`  IndexNow error: ${e.message}`);
  }
}

async function pingGoogleSitemap() {
  // Google deprecated this in 2023 but still accepts; harmless if ignored.
  // Real submission happens via Search Console (manual one-time step).
  const url = `https://www.google.com/ping?sitemap=${encodeURIComponent(SITE_URL + '/sitemap.xml')}`;
  try {
    const res = await fetch(url);
    console.log(`  Google sitemap ping → ${res.status}`);
  } catch (e) { console.error(`  Google ping error: ${e.message}`); }
}

async function main() {
  const key = ensureKeyFile();
  const state = loadState();
  const articles = publishedArticles();

  // Find newly-published or recently-updated articles since last ping.
  const newOrUpdated = [];
  for (const a of articles) {
    const stamp = a.data.updatedAt || a.data.publishedAt;
    const seen = state.lastSeen[a.slug];
    if (seen !== stamp) {
      newOrUpdated.push(a);
      state.lastSeen[a.slug] = stamp;
    }
  }

  if (!newOrUpdated.length) {
    console.log('No new or updated articles since last ping.');
    return;
  }

  const urls = newOrUpdated.map(a => `${SITE_URL}/articles/${a.slug}`);
  console.log(`Pinging ${urls.length} URL(s):`);
  urls.forEach(u => console.log('  ' + u));

  await pingIndexNow(urls, key);
  await pingGoogleSitemap();

  saveState(state);
}

main().catch(e => { console.error(e); process.exit(1); });
