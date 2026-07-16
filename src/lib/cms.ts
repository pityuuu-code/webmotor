import { sql } from '@payloadcms/db-postgres/drizzle'
import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'

import { asDoc } from './types'
import type {
  ArticleDoc,
  CategoryDoc,
  NavLink,
  PageDoc,
  RawMenuItem,
  RedirectDoc,
  SiteDoc,
  SiteSettingsDoc,
} from './types'

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

/*
 * Multi-tenant: a kérés domainje dönti el, melyik weboldalt szolgáljuk ki.
 * Ha a domainhez van bejegyzés az Admin → Weboldalak alatt, annak a beállításai,
 * menüi és tartalmai élnek; ha nincs, az ALAPÉRTELMEZETT oldal (Oldalbeállítások
 * + Menük globálok, és a "Weboldal" mező nélküli tartalmak).
 */

/** A kéréshez tartozó weboldal (vagy null = alapértelmezett oldal). Kérésenként egyszer fut. */
export const getCurrentSite = cache(async (): Promise<SiteDoc | null> => {
  let host = ''
  try {
    host = ((await headers()).get('host') || '').split(':')[0].toLowerCase()
  } catch {
    // Kérés-kontextuson kívül (tesztek, szkriptek) nincs host → alapértelmezett oldal.
    return null
  }
  if (!host) return null
  const payload = await client()
  const result = await payload.find({
    collection: 'sites' as never,
    where: { 'domains.domain': { equals: host } },
    limit: 1,
    depth: 1,
  })
  return (result.docs[0] as unknown as SiteDoc) ?? null
})

/** Tartalom-szűrő: az aktuális weboldal tartalmai, vagy (site nélkül) az alapértelmezetté. */
export function siteContentFilter(site: SiteDoc | null) {
  return site ? { site: { equals: site.id } } : { site: { exists: false } }
}

export const getSettings = cache(async (): Promise<SiteSettingsDoc> => {
  const site = await getCurrentSite()
  if (site) return site
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
  const site = await getCurrentSite()
  const result = await payload.find({
    collection: 'articles' as never,
    where: {
      _status: { equals: 'published' },
      ...siteContentFilter(site),
      ...(options?.categoryId ? { category: { equals: options.categoryId } } : {}),
    },
    sort: '-publishedAt',
    limit: options?.limit ?? 12,
    page: options?.page ?? 1,
    depth: 1,
  })
  return result as unknown as { docs: ArticleDoc[]; totalPages: number }
}

/*
 * Keresés (Postgres full-text).
 *
 * A magyar szótövező önmagában megbízhatatlan (nem idempotens: a "kutyák" szóból
 * "kutya" tő lesz, de a "kutya" keresésből "kuty" – így épp a pontos szóalak nem
 * találna). Ezért a fő ág ékezet-egyszerűsített PREFIX-egyezés ('simple' szótár +
 * szó:* ), ami az agglutináló magyarban a toldalékos alakokat is megtalálja
 * (kutya → kutyák, kutyát, kutyáról), a szótövezett ('hungarian') egyezés pedig
 * ráadás-ágként bővíti a találati kört. Rangsor: cím (A) > kivonat (B) > törzs (C).
 */
const EKEZETES = 'áéíóöőúüű'
const EKEZET_NELKUL = 'aeiooouuu'

/** Ugyanaz az ékezet-egyszerűsítés, mint az SQL-beli translate() – a kettőnek egyeznie kell. */
function ekezetlenit(szo: string): string {
  let out = szo
  for (let i = 0; i < EKEZETES.length; i++) out = out.replaceAll(EKEZETES[i], EKEZET_NELKUL[i])
  return out
}

export async function searchArticles(
  rawQuery: string,
  options?: { limit?: number },
): Promise<ArticleDoc[]> {
  const payload = await client()

  // Csak betűk/számok maradnak; max 8 szó, mind kötelező (ÉS kapcsolat), prefixként.
  const words = rawQuery
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8)
  if (words.length === 0) return []
  const prefixQuery = words.map((w) => `${ekezetlenit(w)}:*`).join(' & ')
  const limit = options?.limit ?? 24
  const site = await getCurrentSite()
  // Multi-tenant: csak az aktuális weboldal cikkei között keresünk.
  const siteCond = site ? sql`and site_id = ${site.id}` : sql`and site_id is null`

  const db = (payload.db as unknown as { drizzle: { execute: (q: unknown) => Promise<{ rows: { id: number | string }[] }> } }).drizzle
  const result = await db.execute(sql`
    with cikkek as (
      select
        id,
        setweight(to_tsvector('simple', translate(lower(coalesce(title, '')), 'áéíóöőúüű', 'aeiooouuu')), 'A')
          || setweight(to_tsvector('simple', translate(lower(coalesce(excerpt, '')), 'áéíóöőúüű', 'aeiooouuu')), 'B')
          || setweight(to_tsvector('simple', translate(lower(coalesce(jsonb_path_query_array(content, '$.**.text')::text, '')), 'áéíóöőúüű', 'aeiooouuu')), 'C') as vektor,
        to_tsvector('hungarian',
          coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' '
            || coalesce(jsonb_path_query_array(content, '$.**.text')::text, '')) as szotovezett
      from articles
      where _status = 'published' ${siteCond}
    )
    select id,
      ts_rank(vektor, to_tsquery('simple', ${prefixQuery}))
        + ts_rank(szotovezett, websearch_to_tsquery('hungarian', ${rawQuery})) as pontszam
    from cikkek
    where vektor @@ to_tsquery('simple', ${prefixQuery})
       or szotovezett @@ websearch_to_tsquery('hungarian', ${rawQuery})
    order by pontszam desc
    limit ${limit}
  `)

  const ids = result.rows.map((row) => Number(row.id))
  if (ids.length === 0) return []

  // A teljes dokumentumokat a szokásos Payload-lekérdezés adja (jogosultság, depth),
  // a sorrendet a keresési pontszám szerint állítjuk vissza.
  const found = await payload.find({
    collection: 'articles' as never,
    where: { id: { in: ids } },
    depth: 1,
    limit: ids.length,
  })
  const docs = found.docs as unknown as ArticleDoc[]
  const byId = new Map(docs.map((doc) => [Number(doc.id), doc]))
  return ids.map((id) => byId.get(id)).filter((doc): doc is ArticleDoc => Boolean(doc))
}

export async function getArticleBySlug(
  slug: string,
  opts?: { draft?: boolean },
): Promise<ArticleDoc | null> {
  const payload = await client()
  const site = await getCurrentSite()
  const draft = opts?.draft ?? false
  const result = await payload.find({
    collection: 'articles' as never,
    draft,
    where: {
      slug: { equals: slug },
      ...siteContentFilter(site),
      ...(draft ? {} : { _status: { equals: 'published' } }),
    },
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
  const site = await getCurrentSite()
  const draft = opts?.draft ?? false
  const result = await payload.find({
    collection: 'pages' as never,
    draft,
    where: {
      slug: { equals: slug },
      ...siteContentFilter(site),
      ...(draft ? {} : { _status: { equals: 'published' } }),
    },
    limit: 1,
    depth: 2,
  })
  return (result.docs[0] as unknown as PageDoc) ?? null
}

/** A menüpontok feloldása kész linkekké (Menük globál vagy a weboldal saját menüi). */
export const getNavigation = cache(async (): Promise<{ header: NavLink[]; footer: NavLink[] }> => {
  const site = await getCurrentSite()
  let nav: { header?: RawMenuItem[] | null; footer?: RawMenuItem[] | null }
  if (site) {
    nav = site
  } else {
    const payload = await client()
    nav = (await payload.findGlobal({ slug: 'navigation' as never, depth: 1 })) as unknown as {
      header?: RawMenuItem[]
      footer?: RawMenuItem[]
    }
  }

  const resolve = (items?: RawMenuItem[] | null): NavLink[] =>
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
  const site = await getCurrentSite()
  const result = await payload.find({
    collection: 'categories' as never,
    where: { slug: { equals: slug }, ...siteContentFilter(site) },
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
  const site = await getCurrentSite()
  const [articles, pages, categories] = await Promise.all([
    payload.find({
      collection: 'articles' as never,
      where: { _status: { equals: 'published' }, ...siteContentFilter(site) },
      limit: 1000,
      depth: 0,
      select: { slug: true, updatedAt: true } as never,
    }),
    payload.find({
      collection: 'pages' as never,
      where: { _status: { equals: 'published' }, ...siteContentFilter(site) },
      limit: 200,
      depth: 0,
      select: { slug: true, updatedAt: true } as never,
    }),
    payload.find({
      collection: 'categories' as never,
      where: { ...siteContentFilter(site) },
      limit: 200,
      depth: 0,
    }),
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
  const site = await getCurrentSite()
  const result = await payload.find({
    collection: 'redirects' as never,
    where: { from: { equals: path }, ...siteContentFilter(site) },
    limit: 1,
  })
  return (result.docs[0] as unknown as RedirectDoc) ?? null
}

/** Az ALAPÉRTELMEZETT oldal abszolút alap-URL-je (env-ből). */
export function getServerURL(): string {
  return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
}

/**
 * A KÉRÉSHEZ tartozó abszolút alap-URL (sitemap, canonical, OG képek).
 * Weboldal-találatnál a kérés domainje (annak fő domainjével), egyébként az env.
 */
export const getBaseURL = cache(async (): Promise<string> => {
  const site = await getCurrentSite()
  if (!site) return getServerURL()
  try {
    const h = await headers()
    const hostWithPort = (h.get('host') || '').toLowerCase()
    const bareHost = hostWithPort.split(':')[0]
    const proto =
      h.get('x-forwarded-proto') ||
      (bareHost === 'localhost' || bareHost.endsWith('.localhost') || /^[\d.]+$/.test(bareHost)
        ? 'http'
        : 'https')
    if (hostWithPort) return `${proto}://${hostWithPort}`
  } catch {
    // kérésen kívül nem fordulhat elő site-találat, de a biztonság kedvéért:
  }
  return getServerURL()
})

/** Relatív média-URL abszolúttá alakítása (OG képekhez, JSON-LD-hez kell). */
export async function absoluteURL(path?: string | null): Promise<string | undefined> {
  if (!path) return undefined
  if (path.startsWith('http')) return path
  return `${await getBaseURL()}${path}`
}
