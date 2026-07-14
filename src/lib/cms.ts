import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { asDoc } from './types'
import type { ArticleDoc, CategoryDoc, NavLink, PageDoc, RedirectDoc, SiteSettingsDoc } from './types'

/**
 * Adatelérési réteg: a frontend KIZÁRÓLAG ezen a fájlon keresztül kérdezi le
 * a tartalmat. Így ha később változik a séma vagy a lekérdezési logika,
 * egyetlen helyen kell módosítani.
 *
 * Megjegyzés: a `collection` nevek castolása azért kell, mert a
 * src/payload-types.ts még a sablon állapotát tükrözi. A `pnpm generate:types`
 * lefuttatása után a castok (as never) törölhetők, és minden szigorúan típusos lesz.
 */

const client = cache(async () => getPayload({ config }))

export const getSettings = cache(async (): Promise<SiteSettingsDoc> => {
  const payload = await client()
  const settings = await payload.findGlobal({ slug: 'site-settings' as never, depth: 1 })
  return settings as unknown as SiteSettingsDoc
})

export async function getArticles(options?: {
  limit?: number
  page?: number
  categoryId?: number
}): Promise<{ docs: ArticleDoc[]; totalPages: number }> {
  const payload = await client()
  const result = await payload.find({
    collection: 'articles' as never,
    where: {
      _status: { equals: 'published' },
      ...(options?.categoryId ? { category: { equals: options.categoryId } } : {}),
    },
    sort: '-publishedAt',
    limit: options?.limit ?? 12,
    page: options?.page ?? 1,
    depth: 1,
  })
  return result as unknown as { docs: ArticleDoc[]; totalPages: number }
}

export async function getArticleBySlug(
  slug: string,
  opts?: { draft?: boolean },
): Promise<ArticleDoc | null> {
  const payload = await client()
  const draft = opts?.draft ?? false
  const result = await payload.find({
    collection: 'articles' as never,
    draft,
    where: { slug: { equals: slug }, ...(draft ? {} : { _status: { equals: 'published' } }) },
    limit: 1,
    depth: 2,
  })
  return (result.docs[0] as unknown as ArticleDoc) ?? null
}

export async function getPageBySlug(
  slug: string,
  opts?: { draft?: boolean },
): Promise<PageDoc | null> {
  const payload = await client()
  const draft = opts?.draft ?? false
  const result = await payload.find({
    collection: 'pages' as never,
    draft,
    where: { slug: { equals: slug }, ...(draft ? {} : { _status: { equals: 'published' } }) },
    limit: 1,
    depth: 2,
  })
  return (result.docs[0] as unknown as PageDoc) ?? null
}

type RawMenuItem = {
  label: string
  linkType?: 'page' | 'custom' | null
  page?: PageDoc | number | null
  url?: string | null
  newTab?: boolean | null
}

/** A Menük globálban felvett menüpontok feloldása kész linkekké. */
export const getNavigation = cache(async (): Promise<{ header: NavLink[]; footer: NavLink[] }> => {
  const payload = await client()
  const nav = (await payload.findGlobal({ slug: 'navigation' as never, depth: 1 })) as unknown as {
    header?: RawMenuItem[]
    footer?: RawMenuItem[]
  }

  const resolve = (items?: RawMenuItem[]): NavLink[] =>
    (items ?? [])
      .map((item): NavLink | null => {
        const page = asDoc(item.page)
        const href =
          item.linkType === 'custom' ? item.url || null : page?.slug ? `/${page.slug}` : null
        if (!item.label || !href) return null
        return { label: item.label, href, newTab: Boolean(item.newTab) }
      })
      .filter((item): item is NavLink => item !== null)

  return { header: resolve(nav.header), footer: resolve(nav.footer) }
})

export async function getCategoryBySlug(slug: string): Promise<CategoryDoc | null> {
  const payload = await client()
  const result = await payload.find({
    collection: 'categories' as never,
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return (result.docs[0] as unknown as CategoryDoc) ?? null
}

export async function getAllForSitemap(): Promise<{
  articles: Pick<ArticleDoc, 'slug' | 'updatedAt'>[]
  pages: Pick<PageDoc, 'slug' | 'updatedAt'>[]
  categories: Pick<CategoryDoc, 'slug'>[]
}> {
  const payload = await client()
  const [articles, pages, categories] = await Promise.all([
    payload.find({
      collection: 'articles' as never,
      where: { _status: { equals: 'published' } },
      limit: 1000,
      depth: 0,
      select: { slug: true, updatedAt: true } as never,
    }),
    payload.find({
      collection: 'pages' as never,
      where: { _status: { equals: 'published' } },
      limit: 200,
      depth: 0,
      select: { slug: true, updatedAt: true } as never,
    }),
    payload.find({ collection: 'categories' as never, limit: 200, depth: 0 }),
  ])
  return {
    articles: articles.docs as unknown as ArticleDoc[],
    pages: pages.docs as unknown as PageDoc[],
    categories: categories.docs as unknown as CategoryDoc[],
  }
}

/** Átirányítás keresése a Redirects kollekcióban egy nem létező útvonalhoz. */
export async function resolveRedirect(path: string): Promise<RedirectDoc | null> {
  const payload = await client()
  const result = await payload.find({
    collection: 'redirects' as never,
    where: { from: { equals: path } },
    limit: 1,
  })
  return (result.docs[0] as unknown as RedirectDoc) ?? null
}

/** Az oldal abszolút alap-URL-je (sitemap, canonical, OG képek). */
export function getServerURL(): string {
  return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
}

/** Relatív média-URL abszolúttá alakítása (OG képekhez, JSON-LD-hez kell). */
export function absoluteURL(path?: string | null): string | undefined {
  if (!path) return undefined
  if (path.startsWith('http')) return path
  return `${getServerURL()}${path}`
}
