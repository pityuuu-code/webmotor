import config from '@payload-config'
import { getPayload } from 'payload'

import { getCurrentSite } from './cms'

/**
 * A kapcsolatűrlap-beküldés feldolgozása: ellenőrzés + mentés a
 * Beérkezett üzenetek közé. A /api/kapcsolat végpont hívja; külön függvény,
 * hogy tesztelhető legyen HTTP nélkül is.
 */

export type ContactInput = {
  name?: unknown
  email?: unknown
  message?: unknown
  website?: unknown // honeypot – embernek láthatatlan mező
  path?: unknown
}

export type ContactResult = { ok: true } | { ok: false; error: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function submitContactMessage(input: ContactInput): Promise<ContactResult> {
  // Honeypot: ha ki van töltve, bot küldte – csendben "sikeres", hogy ne tanuljon.
  if (typeof input.website === 'string' && input.website.trim() !== '') {
    return { ok: true }
  }

  const name = typeof input.name === 'string' ? input.name.trim() : ''
  const email = typeof input.email === 'string' ? input.email.trim() : ''
  const message = typeof input.message === 'string' ? input.message.trim() : ''
  const path = typeof input.path === 'string' ? input.path.slice(0, 300) : ''

  if (!name || name.length > 200) return { ok: false, error: 'Add meg a neved (legfeljebb 200 karakter).' }
  if (!EMAIL_RE.test(email) || email.length > 254)
    return { ok: false, error: 'Érvényes e-mail-címet adj meg.' }
  if (!message || message.length > 5000)
    return { ok: false, error: 'Írj üzenetet (legfeljebb 5000 karakter).' }

  // Multi-tenant: a beküldés domainje alapján kötjük a weboldalhoz (üres = alapértelmezett).
  const site = await getCurrentSite()

  const payload = await getPayload({ config })
  await payload.create({
    collection: 'form-submissions' as never,
    data: { name, email, message, path, site: site?.id ?? null } as never,
    overrideAccess: true,
  })
  return { ok: true }
}
