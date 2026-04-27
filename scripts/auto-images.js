#!/usr/bin/env node
/**
 * scripts/auto-images.js
 * For every article whose hero.src points to a file that doesn't exist on disk,
 * generate a clean abstract SVG hero based on the article's cluster, then convert
 * it to a watermarked WebP. The SVG is deterministic per slug, so the same article
 * always produces the same image — no surprise visual changes between deploys.
 *
 * This is a stop-gap for clinics that don't yet have photographer-shot imagery.
 * It produces brand-consistent placeholder visuals that pass Lighthouse, are
 * indexable, and have keyword-derived alt text. Replace with real photography
 * when available.
 *
 * Usage:  npm run images:auto
 */
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const sharp = require('sharp');

const ARTICLES_DIR = path.join(process.cwd(), 'src', 'content', 'articles');
const OUT_DIR = path.join(process.cwd(), 'public', 'images', 'articles');
const SITE_NAME = 'hairtransplantsource.com';

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Cluster → palette and motif. All in brand green family for consistency.
const CLUSTER_THEMES = {
  'training': {
    bg1: '#143c32', bg2: '#329070', accent: '#daf0e7',
    motif: 'curriculum', // book + check pattern
  },
  'prp-mesotherapy': {
    bg1: '#18493c', bg2: '#54ad8b', accent: '#f0f9f6',
    motif: 'droplets', // PRP-evoking circular pattern
  },
  'fue-dhi': {
    bg1: '#1c5c49', bg2: '#22735a', accent: '#b6e1cf',
    motif: 'grid', // follicle grid pattern
  },
  'clinic-growth': {
    bg1: '#0a221c', bg2: '#22735a', accent: '#86caaf',
    motif: 'lines', // upward trend lines
  },
  'team-operations': {
    bg1: '#143c32', bg2: '#1c5c49', accent: '#daf0e7',
    motif: 'circles', // team / nodes pattern
  },
  'instruments-suppliers': {
    bg1: '#1c4a3a', bg2: '#2c6b56', accent: '#c5e8d8',
    motif: 'grid', // instruments grid pattern
  },
};

// Deterministic pseudo-random based on slug, so the same article always renders
// the same image (idempotent across builds).
function hashSeed(slug) {
  let h = 5381;
  for (let i = 0; i < slug.length; i++) h = ((h << 5) + h + slug.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) % 1000) / 1000;
  };
}

function buildSvg(slug, title, theme) {
  const r = rng(hashSeed(slug));
  const W = 1200, H = 630;

  // Choose motif elements per cluster, deterministic per slug
  const motifs = [];
  if (theme.motif === 'curriculum') {
    // Stack of staggered "card" rectangles
    for (let i = 0; i < 5; i++) {
      const x = 70 + i * 90 + r() * 40;
      const y = 360 - i * 30 + r() * 20;
      const w = 180 + r() * 60;
      const h = 140 + r() * 40;
      motifs.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${theme.accent}" opacity="${0.06 + r()*0.10}"/>`);
    }
  } else if (theme.motif === 'droplets') {
    for (let i = 0; i < 14; i++) {
      const cx = r() * W;
      const cy = r() * H;
      const rad = 20 + r() * 60;
      motifs.push(`<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${theme.accent}" opacity="${0.05 + r()*0.10}"/>`);
    }
  } else if (theme.motif === 'grid') {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 14; col++) {
        if (r() < 0.45) continue;
        const cx = 60 + col * 80 + (row % 2 ? 40 : 0);
        const cy = 80 + row * 70;
        const rad = 4 + r() * 4;
        motifs.push(`<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${theme.accent}" opacity="${0.20 + r()*0.30}"/>`);
      }
    }
  } else if (theme.motif === 'lines') {
    for (let i = 0; i < 6; i++) {
      const y1 = 500 - i * 50 - r() * 30;
      const y2 = 200 - i * 30 - r() * 50;
      motifs.push(`<path d="M 0 ${y1} Q 600 ${(y1+y2)/2 - 40} 1200 ${y2}" stroke="${theme.accent}" stroke-width="2" fill="none" opacity="${0.15 + i*0.05}"/>`);
    }
  } else if (theme.motif === 'circles') {
    for (let i = 0; i < 9; i++) {
      const cx = 100 + r() * (W - 200);
      const cy = 100 + r() * (H - 200);
      const rad = 30 + r() * 80;
      motifs.push(`<circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="${theme.accent}" stroke-width="${1 + r()*2}" opacity="${0.15 + r()*0.20}"/>`);
    }
  }

  // Title text — wrap at ~28 chars
  const words = title.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > 30 && cur) { lines.push(cur.trim()); cur = w; }
    else { cur = (cur + ' ' + w).trim(); }
    if (lines.length >= 3) break;
  }
  if (cur && lines.length < 4) lines.push(cur.trim());

  const titleSvg = lines.slice(0, 4).map((ln, i) =>
    `<text x="80" y="${260 + i * 56}" font-family="-apple-system, Segoe UI, Roboto, sans-serif" font-weight="700" font-size="44" fill="#ffffff">${escapeXml(ln)}</text>`
  ).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg-${slug}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bg1}"/>
      <stop offset="100%" stop-color="${theme.bg2}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg-${slug})"/>
  ${motifs.join('\n  ')}
  <text x="80" y="120" font-family="-apple-system, Segoe UI, Roboto, sans-serif" font-weight="600" font-size="14" fill="${theme.accent}" letter-spacing="3">HAIR TRANSPLANT SOURCE</text>
  ${titleSvg}
</svg>`;
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function watermarkSvg(width) {
  const fontSize = Math.max(14, Math.round(width / 60));
  const padX = Math.round(fontSize * 0.9);
  const padY = Math.round(fontSize * 0.5);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${fontSize + padY * 2}">
       <style>
         .wm { fill: rgba(255,255,255,0.85); font: 600 ${fontSize}px -apple-system,Segoe UI,Roboto,sans-serif; }
         .sh { fill: rgba(0,0,0,0.55); font: 600 ${fontSize}px -apple-system,Segoe UI,Roboto,sans-serif; }
       </style>
       <text x="${width - padX + 1}" y="${fontSize + padY + 1}" class="sh" text-anchor="end">${SITE_NAME}</text>
       <text x="${width - padX}"     y="${fontSize + padY}"     class="wm" text-anchor="end">${SITE_NAME}</text>
     </svg>`
  );
}

async function main() {
  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'));
  let built = 0, skipped = 0;
  for (const f of files) {
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf8');
    const { data } = matter(raw);
    if (!data.hero?.src) continue;

    const slug = f.replace(/\.md$/, '');
    const filename = path.basename(data.hero.src);
    const out = path.join(OUT_DIR, filename);
    if (fs.existsSync(out)) { skipped += 1; continue; }

    const cluster = data.cluster;
    const theme = CLUSTER_THEMES[cluster] ?? CLUSTER_THEMES['training'];
    const svg = buildSvg(slug, data.title, theme);

    // Render SVG → WebP at 1200x630, then composite watermark
    const base = await sharp(Buffer.from(svg)).resize(1200, 630).png().toBuffer();
    const wm = watermarkSvg(1200);
    const wmMeta = await sharp(wm).metadata();
    await sharp(base)
      .composite([{ input: wm, top: 630 - (wmMeta.height || 32) - 8, left: 0 }])
      .webp({ quality: 80, effort: 5 })
      .toFile(out);
    console.log(`  ✓ ${filename}`);
    built += 1;
  }
  console.log(`\nGenerated ${built}, skipped ${skipped} (already exist).`);
}

main().catch(e => { console.error(e); process.exit(1); });
