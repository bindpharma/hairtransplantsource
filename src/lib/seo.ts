import type { Metadata } from 'next';
import { SITE, CLUSTERS } from './site';
import type { Article } from './articles';
import { AUTHORS } from '@/data/authors';

export function buildArticleMetadata(article: Article): Metadata {
  const title = article.metaTitle.length > 0 ? article.metaTitle : article.title;
  const description = article.metaDescription;
  const canonical = `${SITE.url}/articles/${article.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      siteName: SITE.name,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [AUTHORS[article.author]?.name ?? SITE.name],
      images: article.hero?.src ? [{ url: `${SITE.url}${article.hero.src}` }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: article.hero?.src ? [`${SITE.url}${article.hero.src}`] : undefined,
    },
    robots: article.noindex ? { index: false, follow: true } : { index: true, follow: true },
    keywords: [article.primaryKeyword, ...article.secondaryKeywords].join(', '),
  };
}

export function buildArticleJsonLd(article: Article) {
  const author = AUTHORS[article.author];
  const reviewer = article.reviewedBy ? AUTHORS[article.reviewedBy] : undefined;
  const url = `${SITE.url}/articles/${article.slug}`;
  const cluster = article.cluster;
  const sectionLabel = cluster && CLUSTERS[cluster] ? CLUSTERS[cluster].title : undefined;

  // Approximate word count from markdown body (strip frontmatter is already done)
  const wordCount = article.body ? article.body.split(/\s+/).filter(Boolean).length : undefined;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    image: article.hero?.src ? [`${SITE.url}${article.hero.src}`] : undefined,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    inLanguage: SITE.language,
    articleSection: sectionLabel,
    wordCount,
    keywords: [article.primaryKeyword, ...(article.secondaryKeywords ?? [])].filter(Boolean).join(', '),
    author: author && {
      '@type': 'Person',
      name: author.name,
      url: `${SITE.url}${author.url}`,
      jobTitle: author.title,
    },
    reviewedBy: reviewer && {
      '@type': 'Person',
      name: reviewer.name,
      jobTitle: reviewer.title,
      url: `${SITE.url}${reviewer.url}`,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
      logo: { '@type': 'ImageObject', url: `${SITE.url}${SITE.organization.logo}` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isAccessibleForFree: true,
  };

  const faqSchema = article.faq?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: article.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null;

  return faqSchema ? [articleSchema, faqSchema] : [articleSchema];
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.organization.name,
    legalName: SITE.organization.legalName,
    foundingDate: String(SITE.organization.foundingYear),
    url: SITE.url,
    logo: `${SITE.url}${SITE.organization.logo}`,
    sameAs: [],
    contactPoint: [
      { '@type': 'ContactPoint', email: SITE.email, contactType: 'editorial' },
    ],
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url.startsWith('http') ? it.url : `${SITE.url}${it.url}`,
    })),
  };
}
