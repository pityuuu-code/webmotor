import type { MetadataRoute } from 'next'

import { getServerURL } from '@/lib/cms'

export default function robots(): MetadataRoute.Robots {
  const base = getServerURL()
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
