import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

import { searchArticles } from '@/lib/cms'

let payload: Payload
const createdIds: number[] = []

/** Teszt-cikk létrehozása publikált állapotban, egyszerű lexical-törzzsel. */
async function createArticle(opts: { title: string; excerpt?: string; body?: string }) {
  const doc = await payload.create({
    collection: 'articles' as never,
    data: {
      title: opts.title,
      excerpt: opts.excerpt ?? '',
      slug: `kereses-teszt-${Math.random().toString(36).slice(2, 10)}`,
      publishedAt: new Date().toISOString(),
      _status: 'published',
      content: {
        root: {
          type: 'root',
          version: 1,
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          children: [
            {
              type: 'paragraph',
              version: 1,
              children: [{ type: 'text', version: 1, text: opts.body ?? '' }],
            },
          ],
        },
      },
    } as never,
  })
  createdIds.push(Number((doc as { id: number | string }).id))
  return doc
}

describe('Keresés (searchArticles)', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    await createArticle({
      title: 'Kutyák a kertben',
      excerpt: 'Minden a kerti kutyatartásról.',
      body: 'A kutyák imádnak a kertben játszani.',
    })
    await createArticle({
      title: 'Macskatartás lakásban',
      body: 'A cikk törzsében szerepel a kutya szó is, de csak mellékesen.',
    })
  })

  afterAll(async () => {
    for (const id of createdIds) {
      await payload.delete({ collection: 'articles' as never, id })
    }
  })

  it('megtalálja a pontos szót', async () => {
    const results = await searchArticles('kutyák')
    expect(results.some((doc) => doc.title === 'Kutyák a kertben')).toBe(true)
  })

  it('megtalálja a toldalékos alakot a szótő alapján (kutya → kutyák)', async () => {
    const results = await searchArticles('kutya')
    expect(results.some((doc) => doc.title === 'Kutyák a kertben')).toBe(true)
  })

  it('ékezetek nélkül is talál (kutyak → kutyák)', async () => {
    const results = await searchArticles('kutyak')
    expect(results.some((doc) => doc.title === 'Kutyák a kertben')).toBe(true)
  })

  it('a címbeli találat megelőzi a törzsbelit', async () => {
    const results = await searchArticles('kutya')
    const cimTalalat = results.findIndex((doc) => doc.title === 'Kutyák a kertben')
    const torzsTalalat = results.findIndex((doc) => doc.title === 'Macskatartás lakásban')
    expect(cimTalalat).toBeGreaterThanOrEqual(0)
    expect(torzsTalalat).toBeGreaterThanOrEqual(0)
    expect(cimTalalat).toBeLessThan(torzsTalalat)
  })

  it('a piszkált vagy üres bemenet nem okoz hibát', async () => {
    expect(await searchArticles('')).toEqual([])
    expect(await searchArticles('   ')).toEqual([])
    expect(await searchArticles(`'; drop table articles; --`)).toBeDefined()
    expect(await searchArticles('!&|():*')).toEqual([])
  })

  it('vázlat cikket nem ad vissza', async () => {
    const draft = await payload.create({
      collection: 'articles' as never,
      data: {
        title: 'Vázlat a zsiráfokról',
        slug: `kereses-teszt-vazlat-${Math.random().toString(36).slice(2, 10)}`,
        _status: 'draft',
        content: {
          root: {
            type: 'root',
            version: 1,
            direction: 'ltr' as const,
            format: '' as const,
            indent: 0,
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [{ type: 'text', version: 1, text: 'Zsiráfos vázlat.' }],
              },
            ],
          },
        },
      } as never,
    })
    createdIds.push(Number((draft as { id: number | string }).id))
    const results = await searchArticles('zsiráf')
    expect(results.some((doc) => doc.title === 'Vázlat a zsiráfokról')).toBe(false)
  })
})
