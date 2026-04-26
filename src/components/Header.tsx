import Link from 'next/link';
import { CLUSTERS, SITE } from '@/lib/site';

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="inline-block w-8 h-8 rounded-md bg-brand-600 text-white grid place-items-center font-bold">H</span>
          <span className="font-semibold text-gray-900 group-hover:text-brand-700 leading-tight">
            {SITE.name}
            <span className="block text-[10px] font-normal text-gray-500">Independent education</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-700">
          {Object.values(CLUSTERS).map((c) => (
            <Link key={c.slug} href={`/${c.slug}`} className="hover:text-brand-700">
              {c.title}
            </Link>
          ))}
          <Link href="/articles" className="hover:text-brand-700">All articles</Link>
          <Link
            href="/contact"
            className="ml-2 inline-flex items-center px-3 py-1.5 rounded-md bg-brand-600 text-white hover:bg-brand-700"
          >
            For clinics
          </Link>
        </nav>
      </div>
    </header>
  );
}
