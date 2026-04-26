import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Editorial disclosure',
  description: `How ${SITE.name} handles commercial mentions, partnerships and conflicts of interest.`,
  alternates: { canonical: '/disclosure' },
};

export default function DisclosurePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-8 pb-16 prose-article">
      <h1>Editorial disclosure</h1>
      <p>
        {SITE.name} is editorially independent. We do not accept payment in exchange for inclusion, ranking, or favourable
        coverage in any article. This page exists so that distinction is visible.
      </p>
      <h2>Commercial mentions</h2>
      <p>
        Some articles mention commercial providers (clinics, training programmes, device manufacturers, pharmaceutical
        suppliers) by name when they are directly relevant to the topic the reader is researching. When that happens:
      </p>
      <ul>
        <li>The mention is clearly labelled as an industry resource.</li>
        <li>The outbound link is marked <code>rel=&quot;nofollow&quot;</code>.</li>
        <li>We disclose any business relationship at the top of the article when one exists.</li>
      </ul>
      <h2>Affiliate links</h2>
      <p>
        We do not currently use affiliate links anywhere on the site.
      </p>
      <h2>Author conflicts of interest</h2>
      <p>
        Authors and reviewers must disclose any commercial relationship that touches the article they are working on. If
        the conflict is material, we either reassign the article or label the disclosure on the page itself.
      </p>
      <h2>Corrections policy</h2>
      <p>
        We treat factual accuracy as the bar to clear. If we get something wrong, please write to{' '}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a> and we will correct it and date the correction.
      </p>
    </div>
  );
}
