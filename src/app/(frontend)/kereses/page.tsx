import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { ArticleCard } from '@/components/SiteChrome'
import { searchContent } from '@/lib/cms'
import type { PageDoc } from '@/lib/types'

/*
 * Keresési találatok oldala. A találati oldalakat a keresők nem indexelhetik
 * (noindex) – ez SEO-alapszabály: végtelen sok, vékony tartalmú URL keletkezne.
 */
export const metadata: Metadata = {
  title: 'Keresés',
  robots: { index: false, follow: true },
}

type Props = { searchParams: Promise<{ q?: string }> }

/** Oldal-találat kártyája (a cikkeknek saját kártyájuk van). */
function PageCard({ page }: { page: PageDoc }) {
  return (
    <article className="card">
      <div className="card-body">
        <span className="kicker">Oldal</span>
        <h2>
          <Link href={`/${page.slug}`}>{page.title}</Link>
        </h2>
      </div>
    </article>
  )
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = (q ?? '').trim()
  const hits = query ? await searchContent(query) : []

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
              placeholder="Keresés a cikkek és oldalak között…"
              aria-label="Keresés a cikkek és oldalak között"
              autoFocus={!query}
            />
            <button type="submit" className="button">
              Keresés
            </button>
          </form>
        </div>
      </section>

      <section className="shell">
        {query && hits.length === 0 && (
          <div className="empty">
            <h2>Nincs találat a(z) „{query}” keresésre</h2>
            <p>Próbáld meg kevesebb vagy általánosabb szóval.</p>
          </div>
        )}
        {hits.length > 0 && (
          <>
            <p className="search-count">{hits.length} találat</p>
            <div className="card-grid">
              {hits.map((hit) =>
                hit.type === 'article' ? (
                  <ArticleCard key={`cikk-${hit.article.id}`} article={hit.article} />
                ) : (
                  <PageCard key={`oldal-${hit.page.id}`} page={hit.page} />
                ),
              )}
            </div>
          </>
        )}
      </section>
    </>
  )
}
