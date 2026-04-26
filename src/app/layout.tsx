import type { Metadata } from 'next';
import './globals.css';
import { SITE } from '@/lib/site';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { buildOrganizationJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name + ' – ' + SITE.tagline, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  generator: 'Next.js',
  keywords: [
    'hair transplant training',
    'fue training course',
    'dhi training',
    'prp training for hair',
    'mesotherapy training',
    'hair transplant clinic growth',
  ],
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    siteName: SITE.name,
    url: SITE.url,
    title: SITE.name,
    description: SITE.description,
  },
  twitter: { card: 'summary_large_image', site: SITE.twitter },
  alternates: { canonical: SITE.url, types: { 'application/rss+xml': '/rss.xml' } },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = buildOrganizationJsonLd();
  return (
    <html lang={SITE.language}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate" type="application/rss+xml" title={SITE.name} href="/rss.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {/* Privacy-friendly analytics endpoint (self-hosted) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                if (typeof window === 'undefined') return;
                try {
                  var dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1';
                  if (dnt) return;
                  var data = {
                    p: location.pathname,
                    r: document.referrer || '',
                    s: screen.width + 'x' + screen.height,
                    l: navigator.language || '',
                    ts: Date.now()
                  };
                  fetch('/api/track', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data), keepalive: true});
                } catch(e){}
              })();
            `,
          }}
        />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white p-2 border rounded">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
