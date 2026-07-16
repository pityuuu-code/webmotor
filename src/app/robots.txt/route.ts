import { getBaseURL } from '@/lib/cms'

/** robots.txt – domainenként a saját sitemapre mutat (multi-tenant). */
export async function GET() {
  const base = await getBaseURL()
  const body = ['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /api', '', `Sitemap: ${base}/sitemap.xml`, ''].join('\n')
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
