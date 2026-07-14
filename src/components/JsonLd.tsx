import React from 'react'

import { absoluteURL, getServerURL } from '@/lib/cms'
import { asDoc, type ArticleDoc, type SiteSettingsDoc } from '@/lib/types'

/**
 * Schema.org Article structured data – ettől érti meg a Google, hogy a
 * tartalom egy cikk, ki írta és mikor. Rich result megjelenést tesz lehetővé.
 */
export function ArticleJsonLd({
  article,
  settings,
}: {
  article: ArticleDoc
  settings: SiteSettingsDoc
}) {
  const cover = asDoc(article.coverImage)
  const author = asDoc(article.author)

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.seo?.metaDescription || article.excerpt || undefined,
    image: cover?.url ? [absoluteURL(cover.sizes?.og?.url || cover.url)] : undefined,
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt,
    author: author?.name ? { '@type': 'Person', name: author.name } : undefined,
    publisher: { '@type': 'Organization', name: settings.siteName },
    mainEntityOfPage: `${getServerURL()}/cikk/${article.slug}`,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
