import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy',
  description: `${SITE.name} privacy notice — what we log, what we don't, and how to opt out.`,
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-8 pb-16 prose-article">
      <h1>Privacy notice</h1>
      <p>
        We try to keep this short and accurate. {SITE.name} runs a single first-party analytics beacon that records the
        path you visited, the referrer, your screen size and your browser language. We do not set cookies, we do not
        fingerprint, and we do not load third-party trackers on article pages.
      </p>
      <h2>What we log</h2>
      <ul>
        <li>Pathname (e.g. <code>/articles/fue-training-course</code>)</li>
        <li>HTTP referrer, if your browser sends one</li>
        <li>Screen resolution (used to roughly distinguish mobile from desktop)</li>
        <li>Browser language tag</li>
        <li>Country, derived from the request edge — not stored as IP</li>
      </ul>
      <h2>What we don&rsquo;t log</h2>
      <ul>
        <li>Your IP address (not retained after geolocation)</li>
        <li>Any persistent identifier or cookie</li>
        <li>Your behaviour on third-party sites</li>
      </ul>
      <h2>Honoring Do Not Track</h2>
      <p>
        If your browser sends a Do Not Track signal, the analytics beacon is suppressed entirely. No request is sent.
      </p>
      <h2>Outbound links</h2>
      <p>
        Some articles link out to commercial providers for context. Those links are marked <code>rel=&quot;nofollow&quot;</code> and
        we have no insight into your behaviour after you click them.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about this notice: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </div>
  );
}
