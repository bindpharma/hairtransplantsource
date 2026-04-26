import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Methodology',
  description: `How ${SITE.name} researches, writes and reviews articles on hair transplant training, FUE, DHI, PRP and mesotherapy.`,
  alternates: { canonical: '/methodology' },
};

export default function MethodologyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-8 pb-16 prose-article">
      <h1>Methodology</h1>
      <p>
        Every article on {SITE.name} follows the same review pipeline before it is published. This page documents that
        process so readers can judge our work on its merits.
      </p>

      <h2>1. Topic selection</h2>
      <p>
        We choose topics from a fixed editorial map of five clusters: training, PRP &amp; mesotherapy, FUE &amp; DHI,
        clinic growth, and team operations. Topic ideas come from search demand data, questions practitioners send us, and
        gaps we identify in existing publications.
      </p>

      <h2>2. Research</h2>
      <p>
        Research uses primary clinical literature for surgical and pharmacological claims, and direct interviews with
        practising clinicians and clinic operators for operational claims. We do not repeat marketing claims from clinic
        websites without independent corroboration.
      </p>

      <h2>3. Drafting</h2>
      <p>
        Drafts are written by an author with named credentials in the relevant area. The author owns the byline. We do not
        publish anonymous bylines for clinical content.
      </p>

      <h2>4. Medical review</h2>
      <p>
        Clinical articles are reviewed by Dr. Dursun Eser, our named medical reviewer. An article is presented as
        clinically reviewed only when his name appears in the byline; articles without his name in the reviewer field
        are editorial research that has not yet been clinically reviewed and are flagged accordingly. We do not claim
        review that has not happened.
      </p>

      <h2>5. Publication and updates</h2>
      <p>
        After publication, articles enter a 7-day rolling optimisation cycle. Top-performing pages are expanded with
        additional FAQs, internal links, and updated examples. Underperforming pages are revised or, if they cannot be
        defended on quality grounds, marked &lsquo;noindex&rsquo; rather than left in the index.
      </p>

      <h2>6. Disclosures</h2>
      <p>
        We sometimes mention commercial providers in articles for context. When we do, the mention is labelled and the
        outbound link is marked <code>rel=&quot;nofollow&quot;</code>. We are not paid for editorial coverage. See our{' '}
        <a href="/disclosure">editorial disclosure</a>.
      </p>

      <h2>7. Corrections</h2>
      <p>
        If you find a factual error, please email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. Substantive corrections
        are noted at the bottom of the affected article with the date of the correction.
      </p>
    </div>
  );
}
