import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CLUSTERS } from '@/lib/site';
import type { Article } from '@/lib/articles';

export default function RelatedArticles({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Related reading</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/articles/${a.slug}`}
            className="group block rounded-md border border-gray-200 p-4 hover:border-brand-400 hover:bg-brand-50/30 transition"
          >
            <div className="text-[11px] uppercase tracking-wider text-brand-700 font-semibold mb-1">
              {CLUSTERS[a.cluster].title}
            </div>
            <div className="font-semibold text-gray-900 group-hover:text-brand-800 leading-snug">
              {a.title}
            </div>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.metaDescription}</p>
            <span className="inline-flex items-center gap-1 text-xs text-brand-700 mt-2 font-medium">
              Read <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
