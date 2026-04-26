import type { Metadata } from 'next';
import Image from 'next/image';
import { AUTHORS } from '@/data/authors';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About & editorial team',
  description: `Who runs ${SITE.name}, the editorial standards we follow, and the doctors who review our content.`,
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-8 pb-16">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">About {SITE.name}</h1>
      <p className="text-lg text-gray-700 mt-4 leading-relaxed">
        {SITE.name} is an independent publication for clinicians, clinic operators and trainers working in hair
        restoration. We publish technique-level reference material on training programmes, FUE and DHI surgery,
        regenerative scalp treatments such as PRP and mesotherapy, and the operational side of running a busy clinic.
      </p>
      <p className="text-gray-700 mt-4 leading-relaxed">
        We do not run a clinic, sell devices, or operate a training programme of our own. Our editorial line is independent
        from any single provider. When we mention a commercial provider in an article, it is for context only and
        labelled as such.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-10">Editorial standards</h2>
      <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
        <li>Each article has a named author and, where the topic is clinical, a named medical reviewer.</li>
        <li>We cite primary literature where claims could affect patient outcomes.</li>
        <li>We update articles when the underlying evidence or guidance changes; the &ldquo;last updated&rdquo; date is real.</li>
        <li>Articles flagged as low-quality during internal audit are revised or de-indexed rather than left to drift.</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10">Editorial team</h2>
      <div className="grid gap-5 mt-4">
        {Object.values(AUTHORS).map((a) => (
          <div key={a.slug} id={a.slug} className="rounded-md border border-gray-200 p-5 bg-white">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-brand-100 grid place-items-center font-bold text-brand-700 text-lg shrink-0">
                {a.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{a.name}</div>
                <div className="text-xs text-gray-600">{a.title}</div>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{a.bio}</p>
                <ul className="mt-2 text-xs text-gray-600 list-disc pl-5 space-y-0.5">
                  {a.credentials.map((c) => <li key={c}>{c}</li>)}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10">Contact</h2>
      <p className="text-gray-700 mt-2">
        Editorial questions, corrections, or pitches: <a className="underline text-brand-700" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </div>
  );
}
