import { SITE } from '@/lib/site';
import { getAllArticles } from '@/lib/articles';

export const dynamic = 'force-dynamic';

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function GET() {
  const articles = (await getAllArticles()).slice(0, 30);
  const items = articles
    .map(
      (a) => `  <item>
    <title>${escape(a.title)}</title>
    <link>${SITE.url}/articles/${a.slug}</link>
    <guid isPermaLink="true">${SITE.url}/articles/${a.slug}</guid>
    <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
    <description>${escape(a.metaDescription)}</description>
  </item>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escape(SITE.name)}</title>
  <link>${SITE.url}</link>
  <description>${escape(SITE.description)}</description>
  <language>${SITE.language}</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
