import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import { CLUSTERS, ClusterKey, SITE } from '@/lib/site';
import { getArticlesByCluster, getPillarForCluster } from '@/lib/articles';
import { buildBreadcrumbJsonLd } from '@/lib/seo';

export async function generateStaticParams() {
  return Object.values(CLUSTERS).map((c) => ({ cluster: c.slug }));
}

export async function generateMetadata({ params }: { params: { cluster: string } }): Promise<Metadata> {
  const entry = Object.entries(CLUSTERS).find(([, c]) => c.slug === params.cluster);
  if (!entry) return {};
  const [, cluster] = entry;
  return {
    title: cluster.title,
    description: cluster.description,
    alternates: { canonical: `/${cluster.slug}` },
    openGraph: { title: cluster.title, description: cluster.description, url: `${SITE.url}/${cluster.slug}` },
  };
}

export default async function ClusterPage({ params }: { params: { cluster: string } }) {
  const entry = Object.entries(CLUSTERS).find(([, c]) => c.slug === params.cluster) as
    | [ClusterKey, (typeof CLUSTERS)[ClusterKey]]
    | undefined;
  if (!entry) notFound();
  const [key, cluster] = entry;

  const articles = await getArticlesByCluster(key);
  const pillar = await getPillarForCluster(key);
  const supporting = articles.filter((a) => !a.isPillar);

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: cluster.title, url: `/${cluster.slug}` },
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 pt-8 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <nav className="text-xs text-gray-500 flex items-center gap-1 mb-3">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>{cluster.title}</span>
      </nav>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{cluster.title}</h1>
      <p className="text-gray-600 mt-2 max-w-2xl leading-relaxed">{cluster.description}</p>

      {pillar && (
        <Link
          href={`/articles/${pillar.slug}`}
          className="block mt-8 rounded-lg border border-brand-300 bg-brand-50/40 p-5 hover:bg-brand-50 transition"
        >
          <div className="text-[11px] uppercase tracking-wider text-brand-700 font-semibold">Pillar guide</div>
          <div className="text-xl font-bold text-gray-900 mt-1 group-hover:text-brand-800">{pillar.title}</div>
          <p className="text-sm text-gray-700 mt-1.5">{pillar.metaDescription}</p>
          <div className="text-xs text-gray-500 mt-2">
            Updated {format(new Date(pillar.updatedAt), 'MMM d, yyyy')} · {pillar.readingMinutes} min read
          </div>
        </Link>
      )}

      {supporting.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">Supporting articles</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {supporting.map((a) => (
              <Link
                key={a.slug}
                href={`/articles/${a.slug}`}
                className="block rounded-md border border-gray-200 p-4 hover:border-brand-400 hover:bg-brand-50/30"
              >
                <div className="font-semibold text-gray-900">{a.title}</div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.metaDescription}</p>
                <div className="text-xs text-gray-500 mt-2">
                  {a.readingMinutes} min · Updated {format(new Date(a.updatedAt), 'MMM d, yyyy')}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {articles.length === 0 && (
        <p className="mt-8 text-gray-600">Articles in this cluster are being scheduled. Check back soon.</p>
      )}
    </div>
  );
}
