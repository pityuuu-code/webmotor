import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { ArticleCard } from '@/components/SiteChrome'
import { getArticles, getCategoryBySlug } from '@/lib/cms'
import { log404 } from '@/lib/log404'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return {}
  return {
    title: category.name,
    description: category.description || `${category.name} témájú cikkek.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) {
    await log404(`/kategoria/${slug}`)
    notFound()
  }

  const { docs: articles } = await getArticles({ categoryId: category.id, limit: 24 })

  return (
    <>
      <section className="hero">
        <div className="shell">
          <p className="hero-eyebrow">Kategória</p>
          <h1>{category.name}</h1>
          {category.description && <p className="hero-lead">{category.description}</p>}
        </div>
      </section>
      <section className="shell">
        {articles.length === 0 ? (
          <div className="empty">
            <h2>Ebben a kategóriában még nincs cikk</h2>
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
