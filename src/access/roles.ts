import type { Access, FieldAccess, PayloadRequest, Where } from 'payload'

/**
 * Szerepkörök (S11):
 *  - Ügynökség-admin ('admin'): mindent lát és szerkeszt. A régi (szerep nélküli)
 *    felhasználók is adminnak számítanak, így senki nem zárja ki magát.
 *  - Ügyfél-szerkesztő ('client'): CSAK a saját weboldala tartalmát szerkesztheti
 *    (cikkek, oldalak, kategóriák, média, űrlapok, átirányítások); a beállításokhoz,
 *    témához, mérőkódokhoz, weboldalakhoz és más felhasználókhoz nem nyúlhat.
 */

export type AuthUser = {
  id: number
  role?: 'admin' | 'client' | null
  site?: { id: number } | number | null
}

export const isAdminUser = (user: unknown): boolean => {
  if (!user) return false
  return (user as AuthUser).role !== 'client'
}

/** Az ügyfél-szerkesztőhöz rendelt weboldal azonosítója (null = alapértelmezett oldal). */
export const userSiteId = (user: unknown): number | null => {
  const site = (user as AuthUser | null)?.site
  if (site && typeof site === 'object') return site.id
  return (site as number | null | undefined) ?? null
}

/** Where-szűrő az ügyfél-szerkesztő saját weboldalára. */
export const userSiteWhere = (user: unknown): Where => {
  const siteId = userSiteId(user)
  return siteId ? { site: { equals: siteId } } : { site: { exists: false } }
}

/** Csak ügynökség-admin. */
export const adminOnly: Access = ({ req }) => isAdminUser(req.user)

/** Csak ügynökség-admin (mező-szintű, pl. a szerep mezőre). */
export const adminOnlyField: FieldAccess = ({ req }) => isAdminUser(req.user)

/**
 * Tartalom olvasása: látogató a publikáltat, admin mindent, ügyfél-szerkesztő
 * a saját weboldaláét (vázlatostól).
 */
export const contentReadAccess =
  (opts?: { publicPublishedOnly?: boolean }): Access =>
  ({ req: { user } }) => {
    if (!user) return opts?.publicPublishedOnly ? { _status: { equals: 'published' } } : true
    if (isAdminUser(user)) return true
    return userSiteWhere(user)
  }

/** Tartalom módosítása/törlése: admin mindent, ügyfél-szerkesztő a saját oldaláét. */
export const contentMutateAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdminUser(user)) return true
  return userSiteWhere(user)
}

/** Tartalom létrehozása: bejelentkezett felhasználó (az ügyfélnél a weboldalt hook rögzíti). */
export const contentCreateAccess: Access = ({ req: { user } }) => Boolean(user)

/**
 * Ügyfél-szerkesztő által létrehozott/módosított tartalom KÉNYSZERÍTETTEN a
 * saját weboldalára kerül – akkor is, ha a kérésben más szerepel.
 */
export const forceClientSite = ({
  data,
  req,
}: {
  data?: Record<string, unknown>
  req: PayloadRequest
}): Record<string, unknown> | undefined => {
  if (data && req.user && !isAdminUser(req.user)) {
    data.site = userSiteId(req.user)
  }
  return data
}

/** Admin-felületi elrejtés: az ügyfél-szerkesztő ne is lássa (pl. Weboldalak, globálok). */
export const hiddenFromClients = ({ user }: { user: unknown }): boolean => !isAdminUser(user)
