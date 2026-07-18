import config from '@payload-config'
import { getPayload } from 'payload'

import { getCurrentSite } from './cms'

/**
 * 404-naplózás: a nem létező címre futó látogatásokat számolja (útvonalanként
 * és weboldalanként egy sor, számlálóval). Hibára soha nem dob – a 404-oldal
 * kirajzolását semmi nem akaszthatja meg.
 */
export async function log404(rawPath: string): Promise<void> {
  try {
    const path = String(rawPath).slice(0, 300)
    if (!path.startsWith('/')) return
    const site = await getCurrentSite()
    const payload = await getPayload({ config })

    const existing = await payload.find({
      collection: 'not-found-log' as never,
      where: {
        and: [
          { path: { equals: path } },
          site ? { site: { equals: site.id } } : { site: { exists: false } },
        ],
      } as never,
      limit: 1,
      depth: 0,
    })
    const first = existing.docs[0] as { id: number; count?: number } | undefined
    if (first) {
      await payload.update({
        collection: 'not-found-log' as never,
        id: first.id,
        data: { count: (first.count ?? 0) + 1, lastSeenAt: new Date().toISOString() } as never,
        overrideAccess: true,
      })
    } else {
      await payload.create({
        collection: 'not-found-log' as never,
        data: {
          path,
          count: 1,
          lastSeenAt: new Date().toISOString(),
          site: site?.id ?? null,
        } as never,
        overrideAccess: true,
      })
    }
  } catch {
    // naplózási hiba nem érdekli a látogatót
  }
}
