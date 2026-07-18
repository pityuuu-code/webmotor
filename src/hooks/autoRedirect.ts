import type { CollectionAfterChangeHook } from 'payload'

/**
 * Okos átirányítások: ha egy PUBLIKÁLT tartalom URL-jét (slugját) átírják,
 * a régi címről automatikusan 301-es átirányítás készül — nem kell kézzel
 * felvenni, a Google-ranking nem veszik el.
 *
 * Ráadás-takarítás:
 *  - lánc-kisimítás: ami eddig a régi címre mutatott, mostantól az újra mutat
 *    (nincs átirányítás-lánc, ami SEO-ban pontvesztés),
 *  - ha a slug visszaáll egy korábbira, az arra mutató, feleslegessé vált
 *    átirányítást töröljük (nem lenne kör, mert az élő oldal elsőbbséget
 *    élvez, de minek tartogatni).
 *
 * Vázlat-mentésre nem reagál: csak akkor fut, ha a publikált cím változik.
 */
export const autoRedirectOnSlugChange =
  (prefix: string): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, operation, req }) => {
    if (operation !== 'update') return doc
    const next = doc as { slug?: string; _status?: string; site?: { id: number } | number | null }
    const prev = previousDoc as { slug?: string; _status?: string } | undefined
    if (next._status !== 'published' || prev?._status !== 'published') return doc
    if (!prev?.slug || !next.slug || prev.slug === next.slug) return doc

    const from = `${prefix}/${prev.slug}`
    const to = `${prefix}/${next.slug}`
    const siteId =
      typeof next.site === 'object' && next.site ? next.site.id : (next.site ?? null)
    const siteWhere = siteId ? { site: { equals: siteId } } : { site: { exists: false } }
    const payload = req.payload

    try {
      // Régi cím → új cím (ha már van ilyen átirányítás, frissítjük).
      const existing = await payload.find({
        collection: 'redirects' as never,
        where: { and: [{ from: { equals: from } }, siteWhere] } as never,
        limit: 1,
        depth: 0,
      })
      const first = existing.docs[0] as { id: number } | undefined
      if (first) {
        await payload.update({
          collection: 'redirects' as never,
          id: first.id,
          data: { to } as never,
        })
      } else {
        await payload.create({
          collection: 'redirects' as never,
          data: { from, to, permanent: true, site: siteId } as never,
        })
      }

      // Lánc-kisimítás: minden, ami a régi címre mutatott, mutasson az újra.
      const chains = await payload.find({
        collection: 'redirects' as never,
        where: { and: [{ to: { equals: from } }, siteWhere] } as never,
        limit: 100,
        depth: 0,
      })
      for (const redirect of chains.docs as { id: number; from?: string }[]) {
        if (redirect.from === to) continue // ebből önmagára mutató lenne
        await payload.update({
          collection: 'redirects' as never,
          id: redirect.id,
          data: { to } as never,
        })
      }

      // Ha az ÚJ címre mutatott átirányítás (pl. visszanevezés), az már felesleges.
      const stale = await payload.find({
        collection: 'redirects' as never,
        where: { and: [{ from: { equals: to } }, siteWhere] } as never,
        limit: 10,
        depth: 0,
      })
      for (const redirect of stale.docs as { id: number }[]) {
        await payload.delete({ collection: 'redirects' as never, id: redirect.id })
      }
    } catch (err) {
      payload.logger.error({ err }, 'Az automatikus átirányítás létrehozása nem sikerült.')
    }
    return doc
  }
