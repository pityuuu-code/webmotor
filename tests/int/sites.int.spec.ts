import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

import { getArticles, searchArticles, siteContentFilter } from '@/lib/cms'
import type { SiteDoc } from '@/lib/types'

let payload: Payload
let site: SiteDoc
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

async function createArticle(opts: { title: string; siteId?: number }) {
  const doc = (await payload.create({
    collection: 'articles' as never,
    data: {
      title: opts.title,
      slug: `site-teszt-${Math.random().toString(36).slice(2, 10)}`,
      publishedAt: new Date().toISOString(),
      _status: 'published',
      content: lexical(opts.title),
      ...(opts.siteId ? { site: opts.siteId } : {}),
    } as never,
  })) as { id: number }
  created.push({ collection: 'articles', id: doc.id })
  return doc
}

describe('Multi-tenant (Weboldalak)', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    site = (await payload.create({
      collection: 'sites' as never,
      data: {
        name: 'Teszt weboldal',
        domains: [{ domain: 'teszt-site.example' }],
        siteName: 'Teszt Site',
        theme: 'studio',
      } as never,
    })) as unknown as SiteDoc
    created.push({ collection: 'sites', id: site.id })

    await createArticle({ title: 'Mokuska a teszt weboldalon', siteId: site.id })
    await createArticle({ title: 'Mokuska az alapertelmezett oldalon' })
  })

  afterAll(async () => {
    // fordított sorrend: előbb a tartalmak, utána a site
    for (const doc of created.reverse()) {
      await payload.delete({ collection: doc.collection as never, id: doc.id })
    }
  })

  it('a siteContentFilter a weboldal tartalmait adja', async () => {
    const result = await payload.find({
      collection: 'articles' as never,
      where: { title: { contains: 'Mokuska' }, ...siteContentFilter(site) },
    })
    const titles = (result.docs as { title: string }[]).map((d) => d.title)
    expect(titles).toEqual(['Mokuska a teszt weboldalon'])
  })

  it('kérés-kontextus nélkül (alapértelmezett oldal) a site-os tartalom nem látszik', async () => {
    const { docs } = await getArticles({ limit: 100 })
    const titles = docs.map((d) => d.title)
    expect(titles).toContain('Mokuska az alapertelmezett oldalon')
    expect(titles).not.toContain('Mokuska a teszt weboldalon')
  })

  it('a keresés is az aktuális oldalra szűr', async () => {
    const results = await searchArticles('mokuska')
    const titles = results.map((d) => d.title)
    expect(titles).toContain('Mokuska az alapertelmezett oldalon')
    expect(titles).not.toContain('Mokuska a teszt weboldalon')
  })

  it('ugyanaz a slug két külön weboldalon élhet, egy oldalon belül nem', async () => {
    const slug = `slug-utkozes-${Math.random().toString(36).slice(2, 8)}`
    const alap = (await payload.create({
      collection: 'pages' as never,
      data: { title: 'Alap oldal', slug, editorMode: 'richtext', _status: 'published' } as never,
    })) as { id: number }
    created.push({ collection: 'pages', id: alap.id })

    // Ugyanaz a slug a teszt weboldalon: mehet.
    const sitos = (await payload.create({
      collection: 'pages' as never,
      data: {
        title: 'Site-os oldal',
        slug,
        editorMode: 'richtext',
        _status: 'published',
        site: site.id,
      } as never,
    })) as { id: number }
    created.push({ collection: 'pages', id: sitos.id })

    // Még egyszer az alapértelmezett oldalon: ütközés.
    await expect(
      payload.create({
        collection: 'pages' as never,
        data: { title: 'Duplikált', slug, editorMode: 'richtext', _status: 'published' } as never,
      }),
    ).rejects.toThrow()
  })
})
