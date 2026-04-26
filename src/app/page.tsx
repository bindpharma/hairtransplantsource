import Link from 'next/link';
import { ArrowRight, BookOpen, GraduationCap, Microscope, ShieldCheck, Users, Building2 } from 'lucide-react';
import { CLUSTERS, SITE } from '@/lib/site';
import { getAllArticles, getPillarForCluster } from '@/lib/articles';
import { format } from 'date-fns';

const CLUSTER_ICONS: Record<string, any> = {
  training: GraduationCap,
  'prp-mesotherapy': Microscope,
  'fue-dhi': ShieldCheck,
  'clinic-growth': Building2,
  'team-operations': Users,
};

export default async function HomePage() {
  const all = await getAllArticles();
  const latest = all.slice(0, 6);
  const pillarPromises = Object.keys(CLUSTERS).map(async (k) => ({
    key: k,
    pillar: await getPillarForCluster(k as any),
  }));
  const pillars = await Promise.all(pillarPromises);

  return (
    <>
      <section className="border-b border-gray-200 bg-gradient-to-b from-brand-50/60 to-white">
        <div className="max-w-6xl mx-auto px-4 pt-12 pb-14">
          <div className="text-[11px] uppercase tracking-widest text-brand-700 font-semibold mb-3">
            Independent · Doctor-reviewed · Practitioner-focused
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight max-w-3xl">
            The independent reference for hair transplant training, PRP, mesotherapy and clinic growth.
          </h1>
          <p className="text-lg text-gray-700 mt-5 max-w-2xl leading-relaxed">
            Practical guides written for working doctors and the clinics that employ them. Curriculum, technique,
            patient flow and operations — without affiliate fluff.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link href="/training" className="inline-flex items-center gap-1 px-4 py-2 rounded-md bg-brand-600 text-white font-medium hover:bg-brand-700">
              Start with training <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/articles" className="inline-flex items-center gap-1 px-4 py-2 rounded-md border border-gray-300 text-gray-800 font-medium hover:border-brand-500 hover:text-brand-700">
              Browse all articles
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Topical clusters</h2>
          <Link href="/articles" className="text-sm text-brand-700 hover:text-brand-800 font-medium">All articles →</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(CLUSTERS).map(([key, c]) => {
            const Icon = CLUSTER_ICONS[key] ?? BookOpen;
            const pillar = pillars.find((p) => p.key === key)?.pillar;
            return (
              <Link
                key={key}
                href={`/${c.slug}`}
                className="group rounded-lg border border-gray-200 p-5 hover:border-brand-400 hover:shadow-sm transition bg-white"
              >
                <div className="w-9 h-9 rounded-md bg-brand-100 text-brand-700 grid place-items-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-semibold text-gray-900 group-hover:text-brand-800">{c.title}</div>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{c.description}</p>
                {pillar && (
                  <div className="mt-3 text-xs text-brand-700 font-medium inline-flex items-center gap-1">
                    Pillar: {pillar.title} <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {latest.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest articles</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {latest.map((a) => (
              <Link
                key={a.slug}
                href={`/articles/${a.slug}`}
                className="group block rounded-lg border border-gray-200 overflow-hidden hover:border-brand-400 hover:shadow-sm transition bg-white"
              >
                <div className="p-5">
                  <div className="text-[11px] uppercase tracking-wider text-brand-700 font-semibold mb-1.5">
                    {CLUSTERS[a.cluster].title}
                  </div>
                  <div className="font-semibold text-gray-900 group-hover:text-brand-800 leading-snug">
                    {a.title}
                  </div>
                  <p className="text-sm text-gray-600 mt-1.5 line-clamp-3">{a.metaDescription}</p>
                  <div className="text-xs text-gray-500 mt-3">
                    Updated {format(new Date(a.updatedAt), 'MMM d, yyyy')} · {a.readingMinutes} min
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-12 grid gap-6 md:grid-cols-3 text-sm text-gray-700">
          <div>
            <div className="font-semibold text-gray-900 mb-1">Why we exist</div>
            <p>Hair restoration is full of marketing dressed as education. We publish doctor-reviewed, practical reference material for clinics that want to grow on their own merits.</p>
          </div>
          <div>
            <div className="font-semibold text-gray-900 mb-1">Editorial standards</div>
            <p>Articles are written by our editorial research team. Clinical articles are reviewed by Dr. Dursun Eser when marked as such; unmarked articles are editorial research that has not been clinically reviewed. See our <Link href="/methodology" className="underline hover:text-brand-700">methodology</Link>.</p>
          </div>
          <div>
            <div className="font-semibold text-gray-900 mb-1">For clinics</div>
            <p>Want to be quoted in a future guide, or share a clinical case study? <Link href="/contact" className="underline hover:text-brand-700">Get in touch</Link>.</p>
          </div>
        </div>
      </section>
    </>
  );
}
