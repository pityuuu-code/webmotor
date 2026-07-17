import type { PayloadRequest, Where } from 'payload'

export const SITE_COOKIE = 'wm-site'

/** A fejléc-oldalváltó (SiteSwitcher) sütijének értéke a kérésből. */
export function readSiteCookie(req: PayloadRequest): string {
  const cookieHeader = req.headers.get('cookie') || ''
  const match = cookieHeader.match(/(?:^|;\s*)wm-site=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : ''
}

/**
 * Admin listaszűrő az oldalváltóhoz: ha az adminban ki van választva egy
 * weboldal, a listák csak annak a tartalmait mutatják. Csak az admin
 * listanézeteire hat, az API-ra és a frontendre nem.
 */
export const siteBaseListFilter = ({ req }: { req: PayloadRequest }): Where | null => {
  const value = readSiteCookie(req)
  if (!value) return null
  if (value === 'alap') return { site: { exists: false } }
  const id = Number(value)
  if (Number.isFinite(id) && id > 0) return { site: { equals: id } }
  return null
}

/** Új tartalom alapértelmezett weboldala = amelyik az oldalváltóban ki van választva. */
export const siteDefaultValue = ({ req }: { req: PayloadRequest }): number | undefined => {
  const value = readSiteCookie(req)
  const id = Number(value)
  return Number.isFinite(id) && id > 0 ? id : undefined
}
