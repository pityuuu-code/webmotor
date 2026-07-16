import { getAllForSitemap, getBaseURL } from '@/lib/cms'

/**
 * Automatikus sitemap.xml a /sitemap.xml címen – domainenként a saját tartalommal
 * (multi-tenant). Ezt az URL-t kell beküldeni a Google Search Console-ban.
 */

const xmlEscape = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

type Entry = { loc: string; lastmod?: string; changefreq: string; priority: string }

export async function GET() {
  const base = await getBaseURL()
  const { articles, pages, categories } = await getAllForSitemap()

  const entries: Entry[] = [
    { loc: base, changefreq: 'daily', priority: '1.0' },
    ...articles.map((article) => ({
      loc: `${base}/cikk/${article.slug}`,
      lastmod: new Date(article.updatedAt).toISOString(),
      changefreq: 'weekly',
      priority: '0.8',
    })),
    ...pages.map((page) => ({
      loc: `${base}/${page.slug}`,
      lastmod: new Date(page.updatedAt).toISOString(),
      changefreq: 'monthly',
      priority: '0.5',
    })),
    ...categories.map((category) => ({
      loc: `${base}/kategoria/${category.slug}`,
      changefreq: 'weekly',
      priority: '0.6',
    })),
  ]

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries
      .map(
        (entry) =>
          `  <url><loc>${xmlEscape(entry.loc)}</loc>` +
          (entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : '') +
          `<changefreq>${entry.changefreq}</changefreq>` +
          `<priority>${entry.priority}</priority></url>`,
      )
      .join('\n') +
    `\n</urlset>\n`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
