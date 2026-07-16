import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

import { searchContent } from '@/lib/cms'

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

/** A találatok címei, típustól függetlenül, pontszám-sorrendben. */
const cimek = (hits: Awaited<ReturnType<typeof searchContent>>) =>
  hits.map((hit) => (hit.type === 'article' ? hit.article.title : hit.page.title))

async function createArticle(opts: { title: string; excerpt?: string; body?: string }) {
  const doc = (await payload.create({
    collection: 'articles' as never,
    data: {
      title: opts.title,
      excerpt: opts.excerpt ?? '',
      slug: `kereses-teszt-${Math.random().toString(36).slice(2, 10)}`,
      publishedAt: new Date().toISOString(),
      _status: 'published',
      content: lexical(opts.body ?? ''),
    } as never,
  })) as { id: number }
  created.push({ collection: 'articles', id: doc.id })
  return doc
}

describe('Keresés (searchContent)', () => {
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

    // Szövegszerkesztős oldal
    const richPage = (await payload.create({
      collection: 'pages' as never,
      data: {
        title: 'Rólunk',
        slug: `kereses-teszt-rolunk-${Math.random().toString(36).slice(2, 8)}`,
        editorMode: 'richtext',
        _status: 'published',
        content: lexical('Cégünk hörcsögfelszerelések forgalmazásával foglalkozik.'),
      } as never,
    })) as { id: number }
    created.push({ collection: 'pages', id: richPage.id })

    // Oldalépítős (Puck) oldal – a szöveg a layout JSON-ban van
    const builderPage = (await payload.create({
      collection: 'pages' as never,
      data: {
        title: 'Szolgáltatások',
        slug: `kereses-teszt-szolg-${Math.random().toString(36).slice(2, 8)}`,
        editorMode: 'builder',
        _status: 'published',
        layout: {
          root: { props: {} },
          content: [
            {
              type: 'Hero',
              props: { id: 'Hero-1', heading: 'Tengerimalac-panzió', lead: 'Bízd ránk kedvenced!' },
            },
          ],
        },
      } as never,
    })) as { id: number }
    created.push({ collection: 'pages', id: builderPage.id })
  })

  afterAll(async () => {
    for (const doc of created) {
      await payload.delete({ collection: doc.collection as never, id: doc.id })
    }
  })

  it('megtalálja a pontos szót', async () => {
    expect(cimek(await searchContent('kutyák'))).toContain('Kutyák a kertben')
  })

  it('megtalálja a toldalékos alakot a szótő alapján (kutya → kutyák)', async () => {
    expect(cimek(await searchContent('kutya'))).toContain('Kutyák a kertben')
  })

  it('ékezetek nélkül is talál (kutyak → kutyák)', async () => {
    expect(cimek(await searchContent('kutyak'))).toContain('Kutyák a kertben')
  })

  it('a címbeli találat megelőzi a törzsbelit', async () => {
    const titles = cimek(await searchContent('kutya'))
    const cim = titles.indexOf('Kutyák a kertben')
    const torzs = titles.indexOf('Macskatartás lakásban')
    expect(cim).toBeGreaterThanOrEqual(0)
    expect(torzs).toBeGreaterThanOrEqual(0)
    expect(cim).toBeLessThan(torzs)
  })

  it('megtalálja a szövegszerkesztős OLDAL tartalmát is', async () => {
    const hits = await searchContent('hörcsög')
    expect(cimek(hits)).toContain('Rólunk')
    expect(hits.find((h) => h.type === 'page')).toBeTruthy()
  })

  it('megtalálja az oldalépítős (Puck) OLDAL szövegeit is', async () => {
    expect(cimek(await searchContent('tengerimalac'))).toContain('Szolgáltatások')
  })

  it('a piszkált vagy üres bemenet nem okoz hibát', async () => {
    expect(await searchContent('')).toEqual([])
    expect(await searchContent('   ')).toEqual([])
    expect(await searchContent(`'; drop table articles; --`)).toBeDefined()
    expect(await searchContent('!&|():*')).toEqual([])
  })

  it('vázlat cikket nem ad vissza', async () => {
    const draft = (await payload.create({
      collection: 'articles' as never,
      data: {
        title: 'Vázlat a zsiráfokról',
        slug: `kereses-teszt-vazlat-${Math.random().toString(36).slice(2, 10)}`,
        _status: 'draft',
        content: lexical('Zsiráfos vázlat.'),
      } as never,
    })) as { id: number }
    created.push({ collection: 'articles', id: draft.id })
    expect(cimek(await searchContent('zsiráf'))).not.toContain('Vázlat a zsiráfokról')
  })
})
