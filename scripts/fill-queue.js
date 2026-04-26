#!/usr/bin/env node
/**
 * scripts/fill-queue.js
 * Ensures every article in src/data/article-plan.ts has a corresponding
 * .md file in src/content/articles/. Articles missing on disk are created
 * as draft stubs with full frontmatter (no body) so they appear in the
 * queue dashboard but cannot be auto-published until a writer fills them.
 *
 * IMPORTANT: This script does NOT auto-write article bodies. Hair restoration
 * is a YMYL topic; bodies must be human-written and reviewed by a credentialed
 * physician. The script creates the slot, not the content.
 *
 * Usage:  npm run queue:fill
 */
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const ARTICLES_DIR = path.join(process.cwd(), 'src', 'content', 'articles');
const PLAN_FILE = path.join(process.cwd(), 'src', 'data', 'article-plan.json');

if (!fs.existsSync(ARTICLES_DIR)) fs.mkdirSync(ARTICLES_DIR, { recursive: true });

function loadPlan() {
  if (!fs.existsSync(PLAN_FILE)) {
    throw new Error(`Plan file missing: ${PLAN_FILE}`);
  }
  return JSON.parse(fs.readFileSync(PLAN_FILE, 'utf8'));
}

function existingSlugs() {
  if (!fs.existsSync(ARTICLES_DIR)) return new Set();
  return new Set(fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, '')));
}

function defaultFAQStubs(plan) {
  // Generic FAQ scaffolding so the rendered page is structurally complete.
  // These must be edited by the writer before status can move beyond 'draft'.
  return [
    { q: `What is ${plan.primaryKeyword}?`, a: '[Answer to be written.]' },
    { q: `Who is ${plan.primaryKeyword} for?`, a: '[Answer to be written.]' },
    { q: `How long does the ${plan.primaryKeyword} process take?`, a: '[Answer to be written.]' },
    { q: `What does ${plan.primaryKeyword} cost?`, a: '[Answer to be written.]' },
    { q: `What are the most common mistakes around ${plan.primaryKeyword}?`, a: '[Answer to be written.]' },
    { q: `How do I evaluate a provider for ${plan.primaryKeyword}?`, a: '[Answer to be written.]' },
  ];
}

function makeStub(plan) {
  const today = new Date().toISOString().slice(0, 10);
  const data = {
    title: plan.title,
    metaTitle: plan.metaTitle,
    metaDescription: plan.metaDescription,
    cluster: plan.cluster,
    isPillar: !!plan.isPillar,
    primaryKeyword: plan.primaryKeyword,
    secondaryKeywords: plan.secondaryKeywords,
    quickAnswer: '[Quick answer (40–60 words) — to be written.]',
    inShort: '[In-short summary — to be written.]',
    author: plan.author,
    publishedAt: today,
    updatedAt: today,
    status: 'draft',
    partnerLink: plan.partnerLink,
    partnerLinkCount: plan.partnerLinkCount,
    noindex: false,
    hero: {
      src: `/images/articles/${plan.slug}.webp`,
      alt: `Illustration for ${plan.title}`,
    },
    internalLinks: [],
    faq: defaultFAQStubs(plan),
  };
  // Only set reviewedBy when defined — YAML serialiser rejects `undefined`.
  if (plan.reviewedBy) data.reviewedBy = plan.reviewedBy;

  const body = `<!--
DRAFT STUB — do not publish.
Required before status can move to 'queued':
  1. Replace [...] placeholders in frontmatter (quickAnswer, inShort, FAQ answers).
  2. Write 1200–1800 words of body covering the primary keyword:
       ${plan.primaryKeyword}
     and the secondary keywords:
       ${(plan.secondaryKeywords || []).join(', ')}
  3. Include at least one comparison table.
  4. Include 3+ internal links to related articles in the same cluster.
  5. Add 2–4 image references with keyword filenames.
  6. Have the article reviewed by a named, credentialed physician
     (set frontmatter.reviewedBy accordingly) before publish.
-->

## Introduction

[Write 100–150 words framing why a doctor or clinic owner is searching for
"${plan.primaryKeyword}" and what this article will deliver. Avoid generic
filler; be concrete about the reader's situation.]

## What it covers

[Body sections to be written. The publishing automation will refuse to
schedule this article while body word count is below 800.]
`;

  return matter.stringify(body, data);
}

function main() {
  const plan = loadPlan();
  const existing = existingSlugs();
  let created = 0, skipped = 0;

  for (const item of plan) {
    if (existing.has(item.slug)) { skipped += 1; continue; }
    const file = path.join(ARTICLES_DIR, `${item.slug}.md`);
    fs.writeFileSync(file, makeStub(item));
    console.log(`  + ${item.slug}.md`);
    created += 1;
  }

  console.log(`\nCreated ${created} stub(s), skipped ${skipped} existing.`);
  console.log(`Plan total: ${plan.length} articles. On disk: ${existing.size + created}.`);

  if (created > 0) {
    console.log(`\nNext step: write the bodies. Drafts cannot be scheduled until they reach 800+ body words.`);
  }
}

main();
