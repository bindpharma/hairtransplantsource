#!/usr/bin/env node
/**
 * scripts/watermark-images.js
 * Image SEO pipeline:
 *   - Reads source images from public/images/_source/
 *   - Resizes to a max width
 *   - Adds a semi-transparent text watermark (bottom-right) with the site name
 *   - Compresses and writes to public/images/articles/ as .webp
 *   - Idempotent — skips files whose .webp output is newer than the source
 *
 * Filenames should be keyword-based (e.g. fue-training-course.jpg) — the
 * extension is replaced with .webp on output.
 *
 * Usage:  npm run images:watermark
 */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const SOURCE_DIR = path.join(process.cwd(), 'public', 'images', '_source');
const OUT_DIR    = path.join(process.cwd(), 'public', 'images', 'articles');
const SITE_NAME  = 'hairtransplantsource.com';
const MAX_WIDTH  = 1600;
const QUALITY    = 78;

function ensureDirs() {
  if (!fs.existsSync(SOURCE_DIR)) fs.mkdirSync(SOURCE_DIR, { recursive: true });
  if (!fs.existsSync(OUT_DIR))    fs.mkdirSync(OUT_DIR, { recursive: true });
}

function svgWatermark(width) {
  // Watermark size scales with image width.
  const fontSize = Math.max(14, Math.round(width / 60));
  const padX = Math.round(fontSize * 0.9);
  const padY = Math.round(fontSize * 0.5);
  // Right-aligned text, semi-transparent white with subtle shadow.
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

async function processOne(srcPath, outPath) {
  const img = sharp(srcPath, { failOnError: false });
  const meta = await img.metadata();
  const targetWidth = Math.min(meta.width || MAX_WIDTH, MAX_WIDTH);

  const base = await img.resize({ width: targetWidth, withoutEnlargement: true }).toBuffer();
  const baseMeta = await sharp(base).metadata();
  const wmSvg = svgWatermark(baseMeta.width);
  const wmMeta = await sharp(wmSvg).metadata();

  await sharp(base)
    .composite([{
      input: wmSvg,
      top: (baseMeta.height) - (wmMeta.height || 32) - 8,
      left: 0,
    }])
    .webp({ quality: QUALITY, effort: 5 })
    .toFile(outPath);
}

function shouldRebuild(src, out) {
  if (!fs.existsSync(out)) return true;
  return fs.statSync(src).mtimeMs > fs.statSync(out).mtimeMs;
}

async function main() {
  ensureDirs();
  if (!fs.readdirSync(SOURCE_DIR).length) {
    console.log(`No images in ${SOURCE_DIR}.`);
    console.log(`Drop source images (jpg/png/webp) there with keyword filenames, then re-run.`);
    return;
  }

  const sources = fs.readdirSync(SOURCE_DIR).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  let built = 0, skipped = 0, failed = 0;

  for (const file of sources) {
    const src = path.join(SOURCE_DIR, file);
    const outName = file.replace(/\.(jpe?g|png|webp)$/i, '.webp').toLowerCase().replace(/[^a-z0-9.-]/g, '-');
    const out = path.join(OUT_DIR, outName);
    if (!shouldRebuild(src, out)) { skipped += 1; continue; }
    try {
      await processOne(src, out);
      console.log(`  ✓ ${outName}`);
      built += 1;
    } catch (e) {
      console.error(`  ✗ ${file}: ${e.message}`);
      failed += 1;
    }
  }

  console.log(`\nBuilt ${built}, skipped ${skipped}, failed ${failed}.`);
  if (failed) process.exit(1);
}

main();
