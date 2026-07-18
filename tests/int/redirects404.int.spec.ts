import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

import { log404 } from '@/lib/log404'

let payload: Payload
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

async function redirectsFrom(from: string) {
  const result = await payload.find({
    collection: 'redirects' as never,
    where: { from: { equals: from } },
    limit: 10,
    depth: 0,
  })
  return result.docs as { id: number; from: string; to: string; permanent?: boolean }[]
}

describe('Okos átirányítások (autoRedirectOnSlugChange)', () => {
  const slugA = `okos-a-${Math.random().toString(36).slice(2, 8)}`
  const slugB = `okos-b-${Math.random().toString(36).slice(2, 8)}`
  const slugC = `okos-c-${Math.random().toString(36).slice(2, 8)}`
  let articleId = 0

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    const article = (await payload.create({
      collection: 'articles' as never,
      data: {
        title: 'Okos átirányítás teszt',
        slug: slugA,
        publishedAt: new Date().toISOString(),
        _status: 'published',
        content: lexical('Teszt.'),
      } as never,
    })) as { id: number }
    articleId = article.id
    created.push({ collection: 'articles', id: article.id })
  })

  afterAll(async () => {
    for (const from of [`/cikk/${slugA}`, `/cikk/${slugB}`, `/cikk/${slugC}`]) {
      for (const doc of await redirectsFrom(from)) {
        await payload.delete({ collection: 'redirects' as never, id: doc.id })
      }
    }
    for (const doc of created) {
      await payload.delete({ collection: doc.collection as never, id: doc.id })
    }
  })

  it('publikált cikk slug-átírásakor 301-es átirányítás készül', async () => {
    await payload.update({
      collection: 'articles' as never,
      id: articleId,
      data: { slug: slugB, _status: 'published' } as never,
    })
    const redirects = await redirectsFrom(`/cikk/${slugA}`)
    expect(redirects.length).toBe(1)
    expect(redirects[0].to).toBe(`/cikk/${slugB}`)
    expect(redirects[0].permanent).toBe(true)
  })

  it('újabb átírásnál a lánc kisimul (A→C, nem A→B→C)', async () => {
    await payload.update({
      collection: 'articles' as never,
      id: articleId,
      data: { slug: slugC, _status: 'published' } as never,
    })
    const aRedirects = await redirectsFrom(`/cikk/${slugA}`)
    const bRedirects = await redirectsFrom(`/cikk/${slugB}`)
    expect(aRedirects[0].to).toBe(`/cikk/${slugC}`)
    expect(bRedirects[0].to).toBe(`/cikk/${slugC}`)
  })

  it('visszanevezéskor a feleslegessé vált átirányítás törlődik', async () => {
    await payload.update({
      collection: 'articles' as never,
      id: articleId,
      data: { slug: slugB, _status: 'published' } as never,
    })
    // A B-re mutató (from=/cikk/B) átirányítás felesleges lett, mert B újra él.
    expect((await redirectsFrom(`/cikk/${slugB}`)).length).toBe(0)
    // A régi címek az új élő címre mutatnak.
    expect((await redirectsFrom(`/cikk/${slugA}`))[0].to).toBe(`/cikk/${slugB}`)
    expect((await redirectsFrom(`/cikk/${slugC}`))[0].to).toBe(`/cikk/${slugB}`)
  })

  it('vázlat-mentés (nem publikált változás) NEM készít átirányítást', async () => {
    const draftSlug = `okos-vazlat-${Math.random().toString(36).slice(2, 8)}`
    await payload.update({
      collection: 'articles' as never,
      id: articleId,
      draft: true,
      data: { slug: draftSlug, _status: 'draft' } as never,
    })
    expect((await redirectsFrom(`/cikk/${slugB}`)).length).toBe(0)
  })
})

describe('404-napló (log404)', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterAll(async () => {
    const result = await payload.find({
      collection: 'not-found-log' as never,
      where: { path: { contains: '/teszt-404-' } },
      limit: 100,
    })
    for (const doc of result.docs as { id: number }[]) {
      await payload.delete({ collection: 'not-found-log' as never, id: doc.id })
    }
  })

  it('első találatra sort hoz létre, ismétlésre számlál', async () => {
    const path = `/teszt-404-${Math.random().toString(36).slice(2, 8)}`
    await log404(path)
    await log404(path)
    await log404(path)
    const result = await payload.find({
      collection: 'not-found-log' as never,
      where: { path: { equals: path } },
      limit: 10,
    })
    const docs = result.docs as { count?: number }[]
    expect(docs.length).toBe(1)
    expect(docs[0].count).toBe(3)
  })

  it('szemét bemenetre nem dob hibát', async () => {
    await expect(log404('nem-perjeles')).resolves.toBeUndefined()
    await expect(log404('x'.repeat(1000))).resolves.toBeUndefined()
  })
})
