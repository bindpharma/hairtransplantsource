import Link from 'next/link';
import type { Metadata } from 'next';
import { format } from 'date-fns';
import { CLUSTERS } from '@/lib/site';
import { getAllArticles } from '@/lib/articles';

export const metadata: Metadata = {
  title: 'All articles',
  description:
    'Every guide on Hair Transplant Source — training, FUE, DHI, PRP, mesotherapy, clinic growth and team operations.',
  alternates: { canonical: '/articles' },
};

export default async function AllArticles() {
  const articles = await getAllArticles();
  const byCluster = Object.keys(CLUSTERS).reduce<Record<string, typeof articles>>((acc, k) => {
    acc[k] = articles.filter((a) => a.cluster === k);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto px-4 pt-8 pb-16">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">All articles</h1>
      <p className="text-gray-600 mt-2 max-w-2xl">
        {articles.length} published guide{articles.length === 1 ? '' : 's'} across {Object.keys(CLUSTERS).length} topical
        clusters. Updated regularly.
      </p>

      {Object.entries(CLUSTERS).map(([key, cluster]) => {
        const list = byCluster[key];
        if (!list || list.length === 0) return null;
        return (
          <section key={key} className="mt-10">
            <div className="flex items-end justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-900">
                <Link href={`/${cluster.slug}`} className="hover:text-brand-700">{cluster.title}</Link>
              </h2>
              <span className="text-xs text-gray-500">{list.length} article{list.length === 1 ? '' : 's'}</span>
            </div>
            <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
              {list.map((a) => (
                <Link key={a.slug} href={`/articles/${a.slug}`} className="block py-3 hover:bg-gray-50 px-2 -mx-2 rounded">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {a.isPillar && <span className="inline-block text-[10px] uppercase tracking-wider text-white bg-brand-600 rounded px-1.5 py-0.5 mr-2 align-middle">Pillar</span>}
                        {a.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {a.readingMinutes} min · Updated {format(new Date(a.updatedAt), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
