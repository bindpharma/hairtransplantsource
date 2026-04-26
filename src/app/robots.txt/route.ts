import { SITE } from '@/lib/site';

export const dynamic = 'force-static';

export function GET() {
  const body = `User-agent: *
Allow: /

Disallow: /dashboard
Disallow: /api/

Sitemap: ${SITE.url}/sitemap.xml
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
}
