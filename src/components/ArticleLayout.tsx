import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { ChevronRight, CalendarDays, Clock, ShieldCheck } from 'lucide-react';
import { AUTHORS } from '@/data/authors';
import { CLUSTERS, SITE } from '@/lib/site';
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from '@/lib/seo';
import type { Article } from '@/lib/articles';
import QuickAnswer from './QuickAnswer';
import FAQBlock from './FAQBlock';
import AuthorBio from './AuthorBio';
import RelatedArticles from './RelatedArticles';
import PartnerCallout from './PartnerCallout';

export default function ArticleLayout({
  article,
  related,
}: {
  article: Article;
  related: Article[];
}) {
  const author = AUTHORS[article.author];
  const reviewer = article.reviewedBy ? AUTHORS[article.reviewedBy] : undefined;
  const cluster = CLUSTERS[article.cluster];
  const articleSchemas = buildArticleJsonLd(article);
  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: cluster.title, url: `/${cluster.slug}` },
    { name: article.title, url: `/articles/${article.slug}` },
  ]);

  return (
    <article className="max-w-3xl mx-auto px-4 pt-6 pb-12">
      {[...articleSchemas, breadcrumbSchema].map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}

      <nav className="text-xs text-gray-500 flex items-center gap-1 mb-3" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/${cluster.slug}`} className="hover:text-brand-700">{cluster.title}</Link>
      </nav>

      <h1 className="text-3xl md:text-[2.1rem] font-bold leading-tight tracking-tight text-gray-900">
        {article.title}
      </h1>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-3">
        {author && (
          <span>
            By <Link href={author.url} className="font-medium text-gray-700 hover:text-brand-700">{author.name}</Link>
          </span>
        )}
        {reviewer && (
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            Reviewed by <Link href={reviewer.url} className="font-medium text-gray-700 hover:text-brand-700">{reviewer.name}</Link>
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="w-3.5 h-3.5" />
          Updated {format(new Date(article.updatedAt), 'MMM d, yyyy')}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> {article.readingMinutes} min read
        </span>
      </div>

      {article.hero && (
        <figure className="mt-6 rounded-lg overflow-hidden border border-gray-200">
          <Image
            src={article.hero.src}
            alt={article.hero.alt}
            width={1200}
            height={630}
            priority
            className="w-full h-auto"
          />
          <figcaption className="text-[11px] text-gray-500 px-3 py-1.5 bg-gray-50 border-t border-gray-200">
            {article.hero.alt}
          </figcaption>
        </figure>
      )}

      {article.quickAnswer && (
        <QuickAnswer text={article.quickAnswer} />
      )}

      <div
        className="prose-article mt-6"
        dangerouslySetInnerHTML={{ __html: article.html }}
      />

      {article.inShort && (
        <div className="in-short mt-6">
          <b>In short:</b> {article.inShort}
        </div>
      )}

      {article.partnerLink && article.partnerLinkCount && article.partnerLinkCount > 0 && (
        <PartnerCallout target={article.partnerLink} />
      )}

      {article.faq.length > 0 && <FAQBlock items={article.faq} />}

      {author && <AuthorBio author={author} reviewer={reviewer} />}

      <RelatedArticles articles={related} />

      <div className="mt-10 text-xs text-gray-500 border-t pt-3">
        Last reviewed: {format(new Date(article.updatedAt), 'MMMM d, yyyy')}.
        Content is educational only and does not constitute medical advice.
        See our <Link href="/methodology" className="underline hover:text-brand-700">methodology</Link>.
      </div>
    </article>
  );
}
