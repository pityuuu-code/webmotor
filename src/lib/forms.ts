import config from '@payload-config'
import { getPayload } from 'payload'

import { getCurrentSite } from './cms'

/**
 * Űrlap-beküldések feldolgozása: ellenőrzés + mentés a Beérkezett üzenetek
 * közé (+ e-mail értesítés, ha kérve van és van e-mail-küldő beállítva).
 * A /api/kapcsolat és /api/urlap végpontok hívják; külön függvények, hogy
 * HTTP nélkül is tesztelhetők legyenek.
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

/* ── Űrlap-építős (dinamikus) űrlapok ── */

type FormFieldDef = {
  label: string
  fieldType: 'text' | 'email' | 'textarea' | 'select' | 'checkbox'
  required?: boolean | null
  options?: string | null
}

type FormDef = {
  id: number
  name: string
  fields: FormFieldDef[]
  notifyEmails?: string | null
  site?: { id: number } | number | null
}

export type DynamicFormInput = {
  formId?: unknown
  values?: unknown
  website?: unknown // honeypot
  path?: unknown
}

/** A legördülő mező megengedett értékei (soronként egy, üresek kiszűrve). */
function selectOptions(field: FormFieldDef): string[] {
  return String(field.options ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export async function submitDynamicForm(input: DynamicFormInput): Promise<ContactResult> {
  // Honeypot: bot – csendben "sikeres".
  if (typeof input.website === 'string' && input.website.trim() !== '') {
    return { ok: true }
  }

  const formId = Number(input.formId)
  if (!Number.isFinite(formId) || formId <= 0) return { ok: false, error: 'Hiányzó űrlap.' }
  const rawValues =
    input.values && typeof input.values === 'object' ? (input.values as Record<string, unknown>) : {}
  const path = typeof input.path === 'string' ? input.path.slice(0, 300) : ''

  const payload = await getPayload({ config })
  let form: FormDef
  try {
    form = (await payload.findByID({ collection: 'forms' as never, id: formId, depth: 0 })) as unknown as FormDef
  } catch {
    return { ok: false, error: 'Ez az űrlap már nem létezik.' }
  }

  // Ellenőrzés a mező-definíciók alapján; csak a definiált mezők értékei kerülnek mentésre.
  const data: Record<string, string | boolean> = {}
  for (const field of form.fields ?? []) {
    const raw = rawValues[field.label]
    if (field.fieldType === 'checkbox') {
      const checked = raw === true || raw === 'true' || raw === 'on'
      if (field.required && !checked) return { ok: false, error: `Kötelező: ${field.label}` }
      data[field.label] = checked
      continue
    }
    const value = typeof raw === 'string' ? raw.trim().slice(0, 5000) : ''
    if (field.required && !value) return { ok: false, error: `Töltsd ki: ${field.label}` }
    if (value && field.fieldType === 'email' && !EMAIL_RE.test(value))
      return { ok: false, error: `Érvényes e-mail-címet adj meg: ${field.label}` }
    if (value && field.fieldType === 'select' && !selectOptions(field).includes(value))
      return { ok: false, error: `Érvénytelen érték: ${field.label}` }
    data[field.label] = value
  }

  // Kényelmi oszlopok az admin listához: első szöveg/e-mail/hosszú szöveg mező.
  const firstOf = (type: FormFieldDef['fieldType']) => {
    const field = (form.fields ?? []).find((f) => f.fieldType === type)
    const value = field ? data[field.label] : ''
    return typeof value === 'string' ? value : ''
  }

  // A beküldés az űrlap weboldalához tartozik; ha az űrlapnak nincs, a beküldő domainéhez.
  const formSite = typeof form.site === 'object' && form.site ? form.site.id : form.site
  const site = formSite ?? (await getCurrentSite())?.id ?? null

  await payload.create({
    collection: 'form-submissions' as never,
    data: {
      form: form.id,
      data,
      name: firstOf('text'),
      email: firstOf('email'),
      message: firstOf('textarea'),
      path,
      site,
    } as never,
    overrideAccess: true,
  })

  // E-mail értesítés – ha kérve van. Resend-kulcs nélkül a levél a szerver
  // konzoljára íródik (fejlesztői mód); a hiba nem akasztja meg a beküldést.
  const recipients = String(form.notifyEmails ?? '')
    .split(',')
    .map((addr) => addr.trim())
    .filter((addr) => EMAIL_RE.test(addr))
  if (recipients.length > 0) {
    const sorok = (form.fields ?? []).map((f) => `${f.label}: ${String(data[f.label] ?? '')}`)
    try {
      await payload.sendEmail({
        to: recipients.join(', '),
        subject: `Új üzenet érkezett: ${form.name}`,
        text: `Új űrlap-beküldés (${form.name})${path ? ` a(z) ${path} oldalról` : ''}:\n\n${sorok.join('\n')}\n\nA beküldés az adminban is megtekinthető a Beérkezett üzenetek alatt.`,
      })
    } catch (err) {
      payload.logger.error({ err }, 'Az űrlap-értesítő e-mail küldése nem sikerült.')
    }
  }

  return { ok: true }
}
