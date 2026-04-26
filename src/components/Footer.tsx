import Link from 'next/link';
import { CLUSTERS, SITE } from '@/lib/site';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-gray-200 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-4 text-sm">
        <div>
          <div className="font-semibold text-gray-900 mb-1">{SITE.name}</div>
          <p className="text-gray-600 leading-relaxed">{SITE.tagline}</p>
        </div>
        <div>
          <div className="font-semibold text-gray-900 mb-2">Topics</div>
          <ul className="space-y-1.5 text-gray-600">
            {Object.values(CLUSTERS).map((c) => (
              <li key={c.slug}>
                <Link href={`/${c.slug}`} className="hover:text-brand-700">{c.title}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-semibold text-gray-900 mb-2">About</div>
          <ul className="space-y-1.5 text-gray-600">
            <li><Link href="/about" className="hover:text-brand-700">About & editorial team</Link></li>
            <li><Link href="/methodology" className="hover:text-brand-700">Methodology</Link></li>
            <li><Link href="/contact" className="hover:text-brand-700">Contact</Link></li>
            <li><Link href="/articles" className="hover:text-brand-700">All articles</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-gray-900 mb-2">Legal</div>
          <ul className="space-y-1.5 text-gray-600">
            <li><Link href="/privacy" className="hover:text-brand-700">Privacy</Link></li>
            <li><Link href="/disclosure" className="hover:text-brand-700">Editorial disclosure</Link></li>
            <li><Link href="/rss.xml" className="hover:text-brand-700">RSS feed</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-gray-500 flex flex-col md:flex-row md:justify-between gap-2">
          <div>© {year} {SITE.name}. Educational content. Not medical advice.</div>
          <div>Independent editorial. Clinical articles reviewed by Dr. Dursun Eser when marked.</div>
        </div>
      </div>
    </footer>
  );
}
