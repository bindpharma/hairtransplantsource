import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { CLUSTERS, ClusterKey, SITE } from './site';

export type Article = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  cluster: ClusterKey;
  isPillar: boolean;
  primaryKeyword: string;
  secondaryKeywords: string[];
  quickAnswer: string;
  inShort?: string;
  faq: { q: string; a: string }[];
  author: string;
  reviewedBy?: string;
  publishedAt: string;       // ISO date
  updatedAt: string;         // ISO date
  status: 'draft' | 'queued' | 'published';
  publishOn?: string;        // ISO datetime when scheduled
  partnerLink?: 'academy' | 'training' | 'prp' | 'team' | 'home' | null;
  partnerLinkCount?: 0 | 1 | 2;
  noindex?: boolean;
  hero?: { src: string; alt: string };
  images?: { src: string; alt: string }[];
  internalLinks?: string[];  // slugs
  body: string;              // raw markdown
  html: string;              // rendered html
  readingMinutes: number;
};

const ARTICLES_DIR = path.join(process.cwd(), 'src', 'content', 'articles');

export function getArticleSlugs(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

export async function getArticleBySlug(slug: string, opts: { includeUnpublished?: boolean } = {}): Promise<Article | null> {
  const file = path.join(ARTICLES_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  const status = (data.status ?? 'draft') as Article['status'];

  if (!opts.includeUnpublished && status !== 'published') return null;

  const processed = await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(content);
  const html = processed.toString();

  return {
    slug,
    title: data.title,
    metaTitle: data.metaTitle ?? data.title,
    metaDescription: data.metaDescription ?? '',
    cluster: data.cluster,
    isPillar: !!data.isPillar,
    primaryKeyword: data.primaryKeyword,
    secondaryKeywords: data.secondaryKeywords ?? [],
    quickAnswer: data.quickAnswer ?? '',
    inShort: data.inShort,
    faq: data.faq ?? [],
    author: data.author ?? 'editorial-team',
    reviewedBy: data.reviewedBy,
    publishedAt: data.publishedAt,
    updatedAt: data.updatedAt ?? data.publishedAt,
    status,
    publishOn: data.publishOn,
    partnerLink: data.partnerLink ?? null,
    partnerLinkCount: data.partnerLinkCount ?? 0,
    noindex: !!data.noindex,
    hero: data.hero,
    images: data.images ?? [],
    internalLinks: data.internalLinks ?? [],
    body: content,
    html,
    readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
  };
}

export async function getAllArticles(opts: { includeUnpublished?: boolean } = {}): Promise<Article[]> {
  const slugs = getArticleSlugs();
  const articles = await Promise.all(slugs.map((s) => getArticleBySlug(s, opts)));
  return articles.filter((a): a is Article => a !== null).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function getArticlesByCluster(cluster: ClusterKey): Promise<Article[]> {
  const all = await getAllArticles();
  return all.filter((a) => a.cluster === cluster);
}

export async function getPillarForCluster(cluster: ClusterKey): Promise<Article | null> {
  const all = await getArticlesByCluster(cluster);
  return all.find((a) => a.isPillar) ?? null;
}

export async function getRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  const all = await getAllArticles();
  return all
    .filter((a) => a.slug !== article.slug && a.cluster === article.cluster)
    .slice(0, limit);
}

export function articleUrl(slug: string): string {
  return `/articles/${slug}`;
}

export function clusterUrl(cluster: ClusterKey): string {
  return `/${CLUSTERS[cluster].slug}`;
}

export function articleAbsoluteUrl(slug: string): string {
  return `${SITE.url}${articleUrl(slug)}`;
}
