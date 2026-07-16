import { APIError } from 'payload'
import type { CollectionBeforeValidateHook } from 'payload'

/**
 * Oldalankénti (site-onkénti) egyediség-ellenőrzés. Multi-tenant üzemben két
 * KÜLÖNBÖZŐ weboldalnak lehet ugyanolyan URL-je (pl. mindkettőn van /kapcsolat),
 * ugyanazon az oldalon belül viszont nem – ezt adatbázis-szintű unique helyett
 * ez a hook garantálja.
 */
export const uniqueFieldPerSite =
  (collectionSlug: string, fieldName: string, fieldLabel: string): CollectionBeforeValidateHook =>
  async ({ data, originalDoc, req }) => {
    const value = data?.[fieldName] ?? originalDoc?.[fieldName]
    if (typeof value !== 'string' || value === '') return data

    const siteRaw = data?.site !== undefined ? data.site : originalDoc?.site
    const siteId =
      siteRaw && typeof siteRaw === 'object' ? (siteRaw as { id: number }).id : (siteRaw ?? null)

    const currentId = originalDoc?.id ?? data?.id

    const existing = await req.payload.find({
      collection: collectionSlug as never,
      draft: true,
      depth: 0,
      limit: 1,
      where: {
        and: [
          { [fieldName]: { equals: value } },
          siteId ? { site: { equals: siteId } } : { site: { exists: false } },
          ...(currentId ? [{ id: { not_equals: currentId } }] : []),
        ],
      } as never,
    })

    if (existing.totalDocs > 0) {
      throw new APIError(
        `Ez a(z) ${fieldLabel} („${value}”) már foglalt ezen a weboldalon – adj meg másikat.`,
        400,
      )
    }
    return data
  }
