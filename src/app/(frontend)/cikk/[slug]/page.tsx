import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import React from 'react'

import { ArticleJsonLd } from '@/components/JsonLd'
import { DraftBar, LivePreviewListener } from '@/components/LivePreview'
import { RichContent } from '@/components/RichContent'
import { absoluteURL, getArticleBySlug, getServerURL, getSettings, resolveRedirect } from '@/lib/cms'
import { asDoc } from '@/lib/types'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

/** Meta tagek a cikk SEO-mezőiből, értelmes alapértékekkel. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return {}

  const cover = asDoc(article.coverImage)
  const ogImage = asDoc(article.seo?.ogImage)
  const image = absoluteURL(ogImage?.sizes?.og?.url || ogImage?.url || cover?.sizes?.og?.url || cover?.url)

  return {
    title: article.seo?.metaTitle || article.title,
    description: article.seo?.metaDescription || article.excerpt || undefined,
    alternates: {
      canonical: article.seo?.canonicalUrl || `${getServerURL()}/cikk/${article.slug}`,
    },
    robots: article.seo?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      title: article.seo?.metaTitle || article.title,
      description: article.seo?.metaDescription || article.excerpt || undefined,
      publishedTime: article.publishedAt || undefined,
      modifiedTime: article.updatedAt,
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const article = await getArticleBySlug(slug, { draft })

  // Ha nincs ilyen cikk, megnézzük, van-e rá átirányítás (SEO: régi URL-ek megőrzése).
  if (!article) {
    const target = await resolveRedirect(`/cikk/${slug}`)
    if (target) {
      if (target.permanent) permanentRedirect(target.to)
      redirect(target.to)
    }
    notFound()
  }

  const settings = await getSettings()
  const cover = asDoc(article.coverImage)
  const category = asDoc(article.category)
  const author = asDoc(article.author)
  const date = article.publishedAt
    ? new Intl.DateTimeFormat('hu-HU', { dateStyle: 'long' }).format(new Date(article.publishedAt))
    : null

  return (
    <article className="article shell">
      {draft && <DraftBar />}
      {draft && <LivePreviewListener />}
      <ArticleJsonLd article={article} settings={settings} />

      <header className="article-header">
        {category && (
          <Link className="kicker" href={`/kategoria/${category.slug}`}>
            {category.name}
          </Link>
        )}
        <h1>{article.title}</h1>
        <p className="article-meta">
          {author?.name && <span>{author.name}</span>}
          {date && <time dateTime={article.publishedAt ?? undefined}>{date}</time>}
        </p>
      </header>

      {cover?.url && (
        <figure className="article-cover">
          <Image
            src={cover.sizes?.cover?.url || cover.url}
            alt={cover.alt}
            width={cover.sizes?.cover?.width || cover.width || 1600}
            height={cover.sizes?.cover?.height || cover.height || 900}
            priority
            sizes="(max-width: 900px) 100vw, 860px"
          />
        </figure>
      )}

      <div className="article-body">
        <RichContent data={article.content} />
      </div>
    </article>
  )
}
