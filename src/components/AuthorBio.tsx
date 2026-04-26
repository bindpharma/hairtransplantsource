import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import type { Author } from '@/data/authors';

export default function AuthorBio({ author, reviewer }: { author: Author; reviewer?: Author }) {
  return (
    <section className="mt-10 grid gap-4 md:grid-cols-2 border-t pt-6">
      <div className="rounded-md border border-gray-200 p-4 bg-gray-50">
        <div className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Written by</div>
        <Link href={author.url} className="font-semibold text-gray-900 hover:text-brand-700">
          {author.name}
        </Link>
        <div className="text-xs text-gray-600 mb-2">{author.title}</div>
        <p className="text-sm text-gray-700 leading-relaxed">{author.bio}</p>
        <ul className="mt-2 text-xs text-gray-600 list-disc pl-5 space-y-0.5">
          {author.credentials.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </div>

      {reviewer && (
        <div className="rounded-md border border-brand-200 p-4 bg-brand-50">
          <div className="text-[11px] uppercase tracking-wider text-brand-700 font-semibold mb-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Medically reviewed by
          </div>
          <Link href={reviewer.url} className="font-semibold text-gray-900 hover:text-brand-800">
            {reviewer.name}
          </Link>
          <div className="text-xs text-gray-600 mb-2">{reviewer.title}</div>
          <p className="text-sm text-gray-800 leading-relaxed">{reviewer.bio}</p>
          <ul className="mt-2 text-xs text-gray-700 list-disc pl-5 space-y-0.5">
            {reviewer.credentials.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}
