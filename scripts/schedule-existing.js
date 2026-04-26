#!/usr/bin/env node
/**
 * scripts/schedule-existing.js
 * One-time script to schedule existing published articles across upcoming weeks.
 * 
 * Logic:
 *   - 3 launch articles stay published immediately (1 pillar from each of 3 main clusters)
 *   - All other published articles → status: queued, with publishOn distributed across
 *     the next N weeks on Tue/Thu/Sat at random morning/afternoon UTC times
 *   - Drafts are not touched
 *
 * Usage:
 *   node scripts/schedule-existing.js [--dry-run]
 *   node scripts/schedule-existing.js --launch-slugs=slug1,slug2,slug3
 */
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const ARTICLES_DIR = path.join(process.cwd(), 'src', 'content', 'articles');
const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry-run');

// Default launch slugs — 3 strongest pillars across different clusters
const launchArg = process.argv.find(a => a.startsWith('--launch-slugs='));
const LAUNCH_SLUGS = launchArg
  ? launchArg.replace('--launch-slugs=', '').split(',')
  : [
      'hair-transplant-training-course-for-doctors',           // Training pillar
      'prp-and-mesotherapy-training-for-clinics',              // PRP pillar
      'fue-vs-dhi-hair-transplant-comparison',                 // FUE/DHI pillar
    ];

function pickPublishOnDay(weekOffset, dayInWeek) {
  // weekOffset: 1 = next week, 2 = week after, etc.
  // dayInWeek: 0 = Tue, 1 = Thu, 2 = Sat
  const dayOfWeekTargets = [2, 4, 6];
  const targetDow = dayOfWeekTargets[dayInWeek];
  
  const now = new Date();
  // Move to next Monday baseline
  const startMonday = new Date(now);
  const daysUntilMonday = (8 - now.getUTCDay()) % 7 || 7;
  startMonday.setUTCDate(startMonday.getUTCDate() + daysUntilMonday);
  startMonday.setUTCHours(0, 0, 0, 0);
  
  // Add (weekOffset - 1) weeks
  const weekStart = new Date(startMonday.getTime() + (weekOffset - 1) * 7 * 24 * 60 * 60 * 1000);
  
  // Find the target day in that week (Mon=1, Tue=2, ..., Sat=6)
  const target = new Date(weekStart);
  target.setUTCDate(target.getUTCDate() + (targetDow - 1));
  
  // Random hour 08:00-19:59 UTC, random minute
  target.setUTCHours(8 + Math.floor(Math.random() * 12));
  target.setUTCMinutes(Math.floor(Math.random() * 60));
  target.setUTCSeconds(0); target.setUTCMilliseconds(0);
  
  return target.toISOString();
}

function loadAllPublished() {
  return fs.readdirSync(ARTICLES_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const file = path.join(ARTICLES_DIR, f);
      const raw = fs.readFileSync(file, 'utf8');
      const { data, content } = matter(raw);
      return { file, slug: f.replace(/\.md$/, ''), data, content };
    })
    .filter(a => a.data.status === 'published');
}

// Shuffle deterministically by slug hash for stable ordering
function shuffleByHash(arr) {
  return arr.map(item => {
    let h = 5381;
    for (let i = 0; i < item.slug.length; i++) h = ((h << 5) + h + item.slug.charCodeAt(i)) | 0;
    return { item, sort: Math.abs(h) };
  }).sort((a, b) => a.sort - b.sort).map(x => x.item);
}

function main() {
  const all = loadAllPublished();
  const launches = LAUNCH_SLUGS;
  const toSchedule = shuffleByHash(all.filter(a => !launches.includes(a.slug)));

  console.log(`Total published articles: ${all.length}`);
  console.log(`Launch articles (stay live): ${launches.length}`);
  console.log(`To be scheduled: ${toSchedule.length}`);
  console.log(`Schedule cadence: 3 articles/week (Tue/Thu/Sat)`);
  console.log(`Total weeks needed: ${Math.ceil(toSchedule.length / 3)}`);
  console.log(`---`);

  // Distribute across weeks
  let scheduled = 0;
  toSchedule.forEach((article, i) => {
    const weekOffset = Math.floor(i / 3) + 1;   // weeks 1, 2, 3, ...
    const dayInWeek  = i % 3;                    // Tue, Thu, Sat
    const publishOn = pickPublishOnDay(weekOffset, dayInWeek);

    article.data.status = 'queued';
    article.data.publishOn = publishOn;

    console.log(`  [W${weekOffset} ${['Tue','Thu','Sat'][dayInWeek]}] ${article.slug.padEnd(50)} → ${publishOn}`);

    if (!DRY) {
      fs.writeFileSync(article.file, matter.stringify(article.content, article.data));
    }
    scheduled++;
  });

  console.log(`---`);
  console.log(`Scheduled ${scheduled} articles across ${Math.ceil(toSchedule.length / 3)} weeks.`);
  if (DRY) console.log(`(Dry run — no files written)`);
}

main();
