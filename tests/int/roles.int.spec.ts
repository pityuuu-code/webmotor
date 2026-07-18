import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

import type { SiteDoc } from '@/lib/types'

/**
 * Szerepkör-tesztek: az ügyfél-szerkesztő tényleg csak a saját weboldala
 * tartalmát éri el. A Payload local API-t overrideAccess: false-szal hívjuk,
 * így PONT azok a szabályok futnak, mint az admin felületen / REST API-n.
 */

let payload: Payload
let site: SiteDoc
let adminUser: { id: number }
let clientUser: { id: number }
const created: { collection: string; id: number }[] = []

const lexical = (text: string) => ({
  root: {
    type: 'root',
    version: 1,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    children: [
      { type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text }] },
    ],
  },
})

describe('Szerepkörök (ügynökség-admin / ügyfél-szerkesztő)', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    site = (await payload.create({
      collection: 'sites' as never,
      data: {
        name: 'Szerep tesztoldal',
        domains: [{ domain: 'szerep-teszt.example' }],
        siteName: 'Szerep tesztoldal',
        theme: 'studio',
      } as never,
    })) as unknown as SiteDoc
    created.push({ collection: 'sites', id: site.id })

    adminUser = (await payload.create({
      collection: 'users',
      data: {
        name: 'Szerep Admin',
        email: 'szerep-admin@example.com',
        password: 'szerep-1234',
        role: 'admin',
      } as never,
    })) as { id: number }
    created.push({ collection: 'users', id: adminUser.id })

    clientUser = (await payload.create({
      collection: 'users',
      data: {
        name: 'Szerep Ügyfél',
        email: 'szerep-ugyfel@example.com',
        password: 'szerep-1234',
        role: 'client',
        site: site.id,
      } as never,
    })) as { id: number }
    created.push({ collection: 'users', id: clientUser.id })

    const sajat = (await payload.create({
      collection: 'articles' as never,
      data: {
        title: 'Ügyfél saját cikke',
        slug: `szerep-sajat-${Math.random().toString(36).slice(2, 8)}`,
        publishedAt: new Date().toISOString(),
        _status: 'published',
        site: site.id,
        content: lexical('Saját.'),
      } as never,
    })) as { id: number }
    created.push({ collection: 'articles', id: sajat.id })

    const idegen = (await payload.create({
      collection: 'articles' as never,
      data: {
        title: 'Alapoldal cikke (idegen)',
        slug: `szerep-idegen-${Math.random().toString(36).slice(2, 8)}`,
        publishedAt: new Date().toISOString(),
        _status: 'published',
        content: lexical('Idegen.'),
      } as never,
    })) as { id: number }
    created.push({ collection: 'articles', id: idegen.id })
  })

  afterAll(async () => {
    for (const doc of created.reverse()) {
      await payload.delete({ collection: doc.collection as never, id: doc.id })
    }
  })

  const asClient = async () =>
    (await payload.findByID({ collection: 'users', id: clientUser.id })) as never

  const asAdmin = async () =>
    (await payload.findByID({ collection: 'users', id: adminUser.id })) as never

  it('az ügyfél-szerkesztő csak a saját weboldala cikkeit látja', async () => {
    const result = await payload.find({
      collection: 'articles' as never,
      where: { slug: { contains: 'szerep-' } } as never,
      overrideAccess: false,
      user: await asClient(),
      limit: 100,
    })
    const titles = (result.docs as { title: string }[]).map((d) => d.title)
    expect(titles).toContain('Ügyfél saját cikke')
    expect(titles).not.toContain('Alapoldal cikke (idegen)')
  })

  it('az admin mindent lát', async () => {
    const result = await payload.find({
      collection: 'articles' as never,
      where: { slug: { contains: 'szerep-' } } as never,
      overrideAccess: false,
      user: await asAdmin(),
      limit: 100,
    })
    expect((result.docs as { title: string }[]).length).toBeGreaterThanOrEqual(2)
  })

  it('idegen oldal cikkét az ügyfél nem módosíthatja', async () => {
    const idegen = created.find((c) => c.collection === 'articles')
    // a created tömb fordítva van a cleanup miatt — keressük címre
    const found = await payload.find({
      collection: 'articles' as never,
      where: { title: { equals: 'Alapoldal cikke (idegen)' } } as never,
      limit: 1,
    })
    const idegenId = (found.docs[0] as { id: number }).id
    await expect(
      payload.update({
        collection: 'articles' as never,
        id: idegenId,
        data: { title: 'Feltört cím' } as never,
        overrideAccess: false,
        user: await asClient(),
      }),
    ).rejects.toThrow()
    expect(idegen).toBeDefined()
  })

  it('az ügyfél új tartalma kényszerítetten a saját weboldalára kerül', async () => {
    const doc = (await payload.create({
      collection: 'articles' as never,
      data: {
        title: 'Ügyfél új cikke',
        slug: `szerep-uj-${Math.random().toString(36).slice(2, 8)}`,
        _status: 'draft',
        content: lexical('Új.'),
        site: null, // hiába próbálná az alapértelmezett oldalra tenni
      } as never,
      overrideAccess: false,
      user: await asClient(),
    })) as { id: number; site?: { id?: number } | number | null }
    created.push({ collection: 'articles', id: doc.id })
    const siteId = typeof doc.site === 'object' && doc.site ? doc.site.id : doc.site
    expect(siteId).toBe(site.id)
  })

  it('a weboldal-beállításokat (Sites) az ügyfél nem módosíthatja', async () => {
    await expect(
      payload.update({
        collection: 'sites' as never,
        id: site.id,
        data: { theme: 'magazin' } as never,
        overrideAccess: false,
        user: await asClient(),
      }),
    ).rejects.toThrow()
  })

  it('az Oldalbeállítások globált az ügyfél nem módosíthatja', async () => {
    await expect(
      payload.updateGlobal({
        slug: 'site-settings' as never,
        data: { siteName: 'Feltört név' } as never,
        overrideAccess: false,
        user: await asClient(),
      }),
    ).rejects.toThrow()
  })

  it('a saját szerepét az ügyfél nem írhatja át adminra', async () => {
    const updated = (await payload.update({
      collection: 'users',
      id: clientUser.id,
      data: { role: 'admin', name: 'Szerep Ügyfél (átnevezve)' } as never,
      overrideAccess: false,
      user: await asClient(),
    })) as { role?: string; name?: string }
    // a név mehet, a szerep NEM változhat (mező-szintű tiltás)
    expect(updated.name).toBe('Szerep Ügyfél (átnevezve)')
    expect(updated.role).toBe('client')
  })
})
