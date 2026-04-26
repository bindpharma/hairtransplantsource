import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Reach the ${SITE.name} editorial team. We work with clinics, surgeons and trainers on case studies and expert quotes.`,
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Contact</h1>
      <p className="text-gray-700 mt-3 leading-relaxed">
        We work with surgeons, dermatologists, clinic operators and training providers on expert quotes, clinical case
        studies, and editorial reviews. We do not run sponsored content.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <a
          href={`mailto:${SITE.email}?subject=Editorial%20pitch`}
          className="block rounded-md border border-gray-200 p-4 hover:border-brand-400 hover:bg-brand-50/30"
        >
          <div className="font-semibold text-gray-900">Editorial pitches</div>
          <div className="text-sm text-gray-600 mt-1">Suggest a topic, share a clinical case, or volunteer to peer-review.</div>
          <div className="text-xs text-brand-700 mt-2 font-medium">{SITE.email}</div>
        </a>
        <a
          href={`mailto:${SITE.email}?subject=Clinic%20enquiry`}
          className="block rounded-md border border-gray-200 p-4 hover:border-brand-400 hover:bg-brand-50/30"
        >
          <div className="font-semibold text-gray-900">For clinics &amp; trainers</div>
          <div className="text-sm text-gray-600 mt-1">Be quoted in a future guide, or request inclusion in a comparison piece.</div>
          <div className="text-xs text-brand-700 mt-2 font-medium">{SITE.email}</div>
        </a>
      </div>

      <p className="text-xs text-gray-500 mt-6">
        We typically reply within 3 working days. We do not provide medical advice via email.
      </p>
    </div>
  );
}
