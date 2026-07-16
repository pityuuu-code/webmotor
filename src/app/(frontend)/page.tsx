import Link from 'next/link'
import React from 'react'

import { ArticleCard } from '@/components/SiteChrome'
import { getArticles, getSettings } from '@/lib/cms'

// ISR: a lista legfeljebb 60 mp-ig lehet "régi" – publikáláskor a hook azonnal frissíti.
export const revalidate = 60

export default async function HomePage() {
  const [settings, { docs: articles }] = await Promise.all([getSettings(), getArticles({ limit: 12 })])

  return (
    <>
      <section className="hero">
        <div className="shell">
          <p className="hero-eyebrow">{settings.siteName}</p>
          <h1>{settings.tagline || 'Friss cikkek, egy helyen.'}</h1>
        </div>
      </section>

      <section className="shell">
        {articles.length === 0 ? (
          <div className="empty">
            <h2>Még nincs publikált cikk</h2>
            <p>
              Lépj be az <Link href="/admin">admin felületre</Link>, hozd létre az első cikket, majd a
              jobb felső sarokban kattints a Közzététel gombra.
            </p>
          </div>
        ) : (
          <div className="card-grid">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
