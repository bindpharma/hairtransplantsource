import { SITE } from '@/lib/site';

const COPY: Record<string, { label: string; text: string }> = {
  academy:  { label: 'Industry resource',  text: 'Clinical academies that train physicians on hair transplant and regenerative scalp procedures publish open curricula. The Bind Pharma academy is one practitioner-facing example referenced by readers.' },
  training: { label: 'Industry resource',  text: 'For doctors evaluating hands-on hair transplant training in Turkey, the Bind Pharma training programme is one of several clinical training paths available.' },
  prp:      { label: 'Industry resource',  text: 'Clinics looking to standardise PRP protocols sometimes reference the Bind Pharma PRP material as one starting point alongside published literature.' },
  team:     { label: 'Industry resource',  text: 'Clinics expanding their team often look at how providers like the Bind Pharma team structure clinical and patient-care roles.' },
  home:     { label: 'Industry resource',  text: 'Bind Pharma is one of the providers active in this space; readers sometimes ask about it in context of training and supplies.' },
};

export default function PartnerCallout({ target }: { target: keyof typeof COPY }) {
  const item = COPY[target];
  const url = SITE.partner.targets[target as keyof typeof SITE.partner.targets];
  if (!item || !url) return null;

  return (
    <aside className="mt-8 rounded-md border border-gray-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
        {item.label}
      </div>
      <p className="text-sm text-gray-700 leading-relaxed m-0">
        {item.text}{' '}
        <a
          href={url}
          rel="nofollow"
          target="_blank"
          className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
        >
          {SITE.partner.name} →
        </a>
      </p>
      <div className="mt-2 text-[11px] text-gray-500">
        Mentioned for context. We are independent and not paid for editorial coverage.
      </div>
    </aside>
  );
}
