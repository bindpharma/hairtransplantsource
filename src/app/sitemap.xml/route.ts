import { CLUSTERS, SITE } from '@/lib/site';
import { getAllArticles } from '@/lib/articles';

export const dynamic = 'force-dynamic';

export async function GET() {
  const articles = await getAllArticles();

  const urls: { loc: string; lastmod?: string; priority?: string; changefreq?: string }[] = [
    { loc: `${SITE.url}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${SITE.url}/articles`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${SITE.url}/about`, priority: '0.5' },
    { loc: `${SITE.url}/methodology`, priority: '0.5' },
    { loc: `${SITE.url}/contact`, priority: '0.4' },
    { loc: `${SITE.url}/privacy`, priority: '0.2' },
    { loc: `${SITE.url}/disclosure`, priority: '0.2' },
  ];

  for (const c of Object.values(CLUSTERS)) {
    urls.push({ loc: `${SITE.url}/${c.slug}`, priority: '0.8', changefreq: 'weekly' });
  }

  for (const a of articles) {
    if (a.noindex) continue;
    urls.push({
      loc: `${SITE.url}/articles/${a.slug}`,
      lastmod: new Date(a.updatedAt).toISOString(),
      priority: a.isPillar ? '0.9' : '0.7',
      changefreq: 'monthly',
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}${u.changefreq ? `\n    <changefreq>${u.changefreq}</changefreq>` : ''}${u.priority ? `\n    <priority>${u.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
