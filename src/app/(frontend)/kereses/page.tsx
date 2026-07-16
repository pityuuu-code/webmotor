import type { Metadata } from 'next'
import React from 'react'

import { ArticleCard } from '@/components/SiteChrome'
import { searchArticles } from '@/lib/cms'

/*
 * Keresési találatok oldala. A találati oldalakat a keresők nem indexelhetik
 * (noindex) – ez SEO-alapszabály: végtelen sok, vékony tartalmú URL keletkezne.
 */
export const metadata: Metadata = {
  title: 'Keresés',
  robots: { index: false, follow: true },
}

type Props = { searchParams: Promise<{ q?: string }> }

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = (q ?? '').trim()
  const articles = query ? await searchArticles(query) : []

  return (
    <>
      <section className="hero">
        <div className="shell">
          <p className="hero-eyebrow">Keresés</p>
          <h1>{query ? `Találatok: „${query}”` : 'Mit keresel?'}</h1>
          <form className="search-form search-form-large" action="/kereses" role="search">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Keresés a cikkek között…"
              aria-label="Keresés a cikkek között"
              autoFocus={!query}
            />
            <button type="submit" className="button">
              Keresés
            </button>
          </form>
        </div>
      </section>

      <section className="shell">
        {query && articles.length === 0 && (
          <div className="empty">
            <h2>Nincs találat a(z) „{query}” keresésre</h2>
            <p>Próbáld meg kevesebb vagy általánosabb szóval.</p>
          </div>
        )}
        {articles.length > 0 && (
          <>
            <p className="search-count">
              {articles.length} találat
            </p>
            <div className="card-grid">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  )
}
