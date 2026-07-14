import type { MetadataRoute } from 'next'

import { getAllForSitemap, getServerURL } from '@/lib/cms'

/**
 * Automatikus sitemap.xml a /sitemap.xml címen.
 * Ezt az URL-t kell beküldeni a Google Search Console-ban.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getServerURL()
  const { articles, pages, categories } = await getAllForSitemap()

  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    ...articles.map((article) => ({
      url: `${base}/cikk/${article.slug}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...pages.map((page) => ({
      url: `${base}/${page.slug}`,
      lastModified: new Date(page.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
    ...categories.map((category) => ({
      url: `${base}/kategoria/${category.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]
}
