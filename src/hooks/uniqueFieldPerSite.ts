import { APIError } from 'payload'
import type { CollectionBeforeValidateHook } from 'payload'

/**
 * Oldalankénti (site-onkénti) egyediség-ellenőrzés. Multi-tenant üzemben két
 * KÜLÖNBÖZŐ weboldalnak lehet ugyanolyan URL-je (pl. mindkettőn van /kapcsolat),
 * ugyanazon az oldalon belül viszont nem – ezt adatbázis-szintű unique helyett
 * ez a hook garantálja.
 *
 * autoSuffixOnCreate: LÉTREHOZÁSKOR ütközésnél hibadobás helyett számozott
 * változatot ad (cim, cim-2, cim-3…) – így működik az admin Duplikálás gombja
 * és a WP-s megszokás is. Módosításkor (kézi átírásnál) marad a hibaüzenet.
 */
export const uniqueFieldPerSite =
  (
    collectionSlug: string,
    fieldName: string,
    fieldLabel: string,
    opts?: { autoSuffixOnCreate?: boolean },
  ): CollectionBeforeValidateHook =>
  async ({ data, originalDoc, req, operation }) => {
    const value = data?.[fieldName] ?? originalDoc?.[fieldName]
    if (typeof value !== 'string' || value === '') return data

    const siteRaw = data?.site !== undefined ? data.site : originalDoc?.site
    const siteId =
      siteRaw && typeof siteRaw === 'object' ? (siteRaw as { id: number }).id : (siteRaw ?? null)

    const currentId = originalDoc?.id ?? data?.id

    const foglalt = async (jelolt: string): Promise<boolean> => {
      const existing = await req.payload.find({
        collection: collectionSlug as never,
        draft: true,
        depth: 0,
        limit: 1,
        where: {
          and: [
            { [fieldName]: { equals: jelolt } },
            siteId ? { site: { equals: siteId } } : { site: { exists: false } },
            ...(currentId ? [{ id: { not_equals: currentId } }] : []),
          ],
        } as never,
      })
      return existing.totalDocs > 0
    }

    if (!(await foglalt(value))) return data

    if (opts?.autoSuffixOnCreate && operation === 'create' && data) {
      for (let i = 2; i <= 50; i++) {
        const jelolt = `${value}-${i}`
        if (!(await foglalt(jelolt))) {
          data[fieldName] = jelolt
          return data
        }
      }
    }

    throw new APIError(
      `Ez a(z) ${fieldLabel} („${value}”) már foglalt ezen a weboldalon – adj meg másikat.`,
      400,
    )
  }
