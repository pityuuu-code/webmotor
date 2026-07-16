import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import React from 'react'

import { DraftBar, LivePreviewListener } from '@/components/LivePreview'
import { PuckRender } from '@/components/PuckRender'
import { RichContent } from '@/components/RichContent'
import { getBaseURL, getPageBySlug, resolveRedirect } from '@/lib/cms'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (!page) return {}

  return {
    title: page.seo?.metaTitle || page.title,
    description: page.seo?.metaDescription || undefined,
    alternates: { canonical: page.seo?.canonicalUrl || `${await getBaseURL()}/${page.slug}` },
    robots: page.seo?.noIndex ? { index: false, follow: false } : undefined,
  }
}

export default async function StaticPage({ params }: Props) {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const page = await getPageBySlug(slug, { draft })

  if (!page) {
    const target = await resolveRedirect(`/${slug}`)
    if (target) {
      if (target.permanent) permanentRedirect(target.to)
      redirect(target.to)
    }
    notFound()
  }

  // Oldalépítővel készült oldal: a Puck-elrendezést jelenítjük meg.
  if (page.editorMode === 'builder') {
    return (
      <>
        {draft && <DraftBar />}
        {draft && <LivePreviewListener />}
        <PuckRender data={page.layout ?? null} />
      </>
    )
  }

  return (
    <article className="article shell">
      {draft && <DraftBar />}
      {draft && <LivePreviewListener />}
      <header className="article-header">
        <h1>{page.title}</h1>
      </header>
      <div className="article-body">
        <RichContent data={page.content} />
      </div>
    </article>
  )
}
