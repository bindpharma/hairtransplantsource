import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { AUTHORS } from '@/data/authors';
import { SITE } from '@/lib/site';
import { getAllArticles } from '@/lib/articles';

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  return Object.keys(AUTHORS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const author = AUTHORS[params.slug];
  if (!author) return { title: 'Author not found' };

  const url = `${SITE.url}/authors/${author.slug}`;
  return {
    title: `${author.name} — ${author.title} | ${SITE.name}`,
    description: author.bio.slice(0, 160),
    alternates: { canonical: url },
    openGraph: {
      title: `${author.name} — ${author.title}`,
      description: author.bio,
      url,
      type: 'profile',
      siteName: SITE.name,
    },
    twitter: {
      card: 'summary',
      title: `${author.name} — ${author.title}`,
      description: author.bio.slice(0, 160),
    },
  };
}

export default async function AuthorPage({ params }: Props) {
  const author = AUTHORS[params.slug];
  if (!author) notFound();

  const all = await getAllArticles();
  const reviewed = all.filter((a) => a.reviewedBy === author.slug);
  const written = all.filter((a) => a.author === author.slug);

  // Person schema for E-E-A-T
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    jobTitle: author.title,
    description: author.bio,
    url: `${SITE.url}/authors/${author.slug}`,
    image: `${SITE.url}${author.avatar}`,
    knowsAbout: author.credentials,
    worksFor: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
  };

  return (
    <article className="prose prose-slate mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <header className="not-prose border-b border-slate-200 pb-6 mb-8">
        <p className="text-sm uppercase tracking-wide text-brand-700 mb-2">Author</p>
        <h1 className="text-3xl font-semibold text-slate-900 mb-1">{author.name}</h1>
        <p className="text-lg text-slate-600">{author.title}</p>
      </header>

      <h2>About</h2>
      <p>{author.bio}</p>

      <h2>Credentials</h2>
      <ul>
        {author.credentials.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>

      {reviewed.length > 0 && (
        <>
          <h2>Articles medically reviewed by {author.name}</h2>
          <ul>
            {reviewed.map((a) => (
              <li key={a.slug}>
                <Link href={`/articles/${a.slug}`}>{a.title}</Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {written.length > 0 && author.slug !== 'editorial-team' && (
        <>
          <h2>Articles authored</h2>
          <ul>
            {written.map((a) => (
              <li key={a.slug}>
                <Link href={`/articles/${a.slug}`}>{a.title}</Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>Editorial policy</h2>
      <p>
        Hair Transplant Source follows a strict editorial policy. See our{' '}
        <Link href="/methodology">methodology</Link> page for details on how
        clinical content is reviewed and what the reviewer credit means.
      </p>
    </article>
  );
}
