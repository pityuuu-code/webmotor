import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

import { getArticles, getArticleBySlug, searchContent } from '@/lib/cms'

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

async function createArticle(opts: { title: string; slug: string; publishedAt: string }) {
  const doc = (await payload.create({
    collection: 'articles' as never,
    data: {
      title: opts.title,
      slug: opts.slug,
      publishedAt: opts.publishedAt,
      _status: 'published',
      content: lexical(opts.title),
    } as never,
  })) as { id: number }
  created.push({ collection: 'articles', id: doc.id })
  return doc
}

describe('Időzített publikálás', () => {
  const jovoSlug = `idozitett-jovo-${Math.random().toString(36).slice(2, 8)}`
  const multSlug = `idozitett-mult-${Math.random().toString(36).slice(2, 8)}`

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    await createArticle({
      title: 'Jövőbeli időzített cikk',
      slug: jovoSlug,
      publishedAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // +1 óra
    })
    await createArticle({
      title: 'Már megjelent cikk',
      slug: multSlug,
      publishedAt: new Date(Date.now() - 60 * 1000).toISOString(), // -1 perc
    })
  })

  afterAll(async () => {
    for (const doc of created) {
      await payload.delete({ collection: doc.collection as never, id: doc.id })
    }
  })

  it('a jövőbeli cikk nem jelenik meg a listában, a múltbeli igen', async () => {
    const { docs } = await getArticles({ limit: 100 })
    const titles = docs.map((d) => d.title)
    expect(titles).toContain('Már megjelent cikk')
    expect(titles).not.toContain('Jövőbeli időzített cikk')
  })

  it('a jövőbeli cikk közvetlen linkről sem érhető el (látogatóként)', async () => {
    expect(await getArticleBySlug(jovoSlug)).toBeNull()
    expect(await getArticleBySlug(multSlug)).not.toBeNull()
  })

  it('a vázlat-előnézet (szerkesztőknek) a jövőbeli cikket is mutatja', async () => {
    expect(await getArticleBySlug(jovoSlug, { draft: true })).not.toBeNull()
  })

  it('a keresés sem adja vissza a jövőbeli cikket', async () => {
    const hits = await searchContent('időzített')
    const titles = hits.map((h) => (h.type === 'article' ? h.article.title : h.page.title))
    expect(titles).not.toContain('Jövőbeli időzített cikk')
  })
})

describe('Slug auto-egyediség létrehozáskor (duplikáláshoz)', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterAll(async () => {
    const result = await payload.find({
      collection: 'articles' as never,
      where: { slug: { contains: 'auto-slug-' } },
      limit: 100,
      depth: 0,
    })
    for (const doc of result.docs as { id: number }[]) {
      await payload.delete({ collection: 'articles' as never, id: doc.id })
    }
  })

  it('ütköző sluggal létrehozott cikk számozott változatot kap (-2, -3)', async () => {
    const alap = `auto-slug-${Math.random().toString(36).slice(2, 8)}`
    const make = () =>
      payload.create({
        collection: 'articles' as never,
        data: {
          title: 'Duplikált cikk',
          slug: alap,
          _status: 'draft',
          content: lexical('x'),
        } as never,
      }) as Promise<{ id: number; slug: string }>

    const first = await make()
    const second = await make()
    const third = await make()
    expect(first.slug).toBe(alap)
    expect(second.slug).toBe(`${alap}-2`)
    expect(third.slug).toBe(`${alap}-3`)
  })

  it('MÓDOSÍTÁSKOR az ütközés továbbra is hiba (nem csendes átnevezés)', async () => {
    const a = `auto-slug-a-${Math.random().toString(36).slice(2, 8)}`
    const b = `auto-slug-b-${Math.random().toString(36).slice(2, 8)}`
    await payload.create({
      collection: 'articles' as never,
      data: { title: 'A', slug: a, _status: 'draft', content: lexical('a') } as never,
    })
    const docB = (await payload.create({
      collection: 'articles' as never,
      data: { title: 'B', slug: b, _status: 'draft', content: lexical('b') } as never,
    })) as { id: number }
    await expect(
      payload.update({
        collection: 'articles' as never,
        id: docB.id,
        data: { slug: a } as never,
      }),
    ).rejects.toThrow()
  })
})
