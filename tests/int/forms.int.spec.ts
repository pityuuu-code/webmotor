import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

import { submitContactMessage, submitDynamicForm } from '@/lib/forms'

let payload: Payload
const TESZT_EMAIL = 'urlap-teszt@example.com'

async function osszesTesztBekuldes() {
  const result = await payload.find({
    collection: 'form-submissions' as never,
    where: { email: { equals: TESZT_EMAIL } },
    limit: 100,
  })
  return result.docs as { id: number; name: string; message: string }[]
}

describe('Kapcsolatűrlap (submitContactMessage)', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterAll(async () => {
    for (const doc of await osszesTesztBekuldes()) {
      await payload.delete({ collection: 'form-submissions' as never, id: doc.id })
    }
  })

  it('érvényes beküldést elment', async () => {
    const result = await submitContactMessage({
      name: 'Teszt Elek',
      email: TESZT_EMAIL,
      message: 'Ez egy teszt üzenet.',
      website: '',
      path: '/kapcsolat',
    })
    expect(result.ok).toBe(true)
    const docs = await osszesTesztBekuldes()
    expect(docs.some((d) => d.message === 'Ez egy teszt üzenet.')).toBe(true)
  })

  it('kitöltött honeypot esetén nem ment (de "sikeresnek" hazudja magát)', async () => {
    const elotte = (await osszesTesztBekuldes()).length
    const result = await submitContactMessage({
      name: 'Bot Béla',
      email: TESZT_EMAIL,
      message: 'spam spam spam',
      website: 'http://spam.example.com',
    })
    expect(result.ok).toBe(true)
    expect((await osszesTesztBekuldes()).length).toBe(elotte)
  })

  it('hibás e-mail-címet elutasít', async () => {
    const result = await submitContactMessage({
      name: 'Teszt Elek',
      email: 'nem-email',
      message: 'Üzenet.',
    })
    expect(result.ok).toBe(false)
  })

  it('hiányzó nevet/üzenetet elutasít', async () => {
    expect((await submitContactMessage({ name: '', email: TESZT_EMAIL, message: 'x' })).ok).toBe(false)
    expect((await submitContactMessage({ name: 'X', email: TESZT_EMAIL, message: '' })).ok).toBe(false)
  })

  it('nem szöveges bemenetet elutasít', async () => {
    const result = await submitContactMessage({
      name: { gonosz: 'objektum' },
      email: TESZT_EMAIL,
      message: 'x',
    })
    expect(result.ok).toBe(false)
  })
})

describe('Űrlap-építő (submitDynamicForm)', () => {
  let formId = 0
  const DIN_EMAIL = 'dinamikus-teszt@example.com'

  async function dinBekuldesek() {
    const result = await payload.find({
      collection: 'form-submissions' as never,
      where: { form: { equals: formId } },
      limit: 100,
    })
    return result.docs as { id: number; name?: string; email?: string; data?: Record<string, unknown> }[]
  }

  beforeAll(async () => {
    const form = (await payload.create({
      collection: 'forms' as never,
      data: {
        name: 'Ajánlatkérés (teszt)',
        fields: [
          { label: 'Név', fieldType: 'text', required: true },
          { label: 'E-mail-cím', fieldType: 'email', required: true },
          { label: 'Csomag', fieldType: 'select', options: 'Alap\nPrémium' },
          { label: 'Üzenet', fieldType: 'textarea' },
          { label: 'Elfogadom az adatkezelést', fieldType: 'checkbox', required: true },
        ],
        notifyEmails: 'ertesites@example.com',
      } as never,
    })) as { id: number }
    formId = form.id
  })

  afterAll(async () => {
    for (const doc of await dinBekuldesek()) {
      await payload.delete({ collection: 'form-submissions' as never, id: doc.id })
    }
    await payload.delete({ collection: 'forms' as never, id: formId })
  })

  it('érvényes beküldést elment (kényelmi oszlopokkal együtt)', async () => {
    const result = await submitDynamicForm({
      formId,
      values: {
        'Név': 'Dinamikus Dénes',
        'E-mail-cím': DIN_EMAIL,
        'Csomag': 'Prémium',
        'Üzenet': 'Kérnék egy ajánlatot.',
        'Elfogadom az adatkezelést': true,
      },
      website: '',
      path: '/ajanlatkeres',
    })
    expect(result.ok).toBe(true)
    const docs = await dinBekuldesek()
    expect(docs.length).toBe(1)
    expect(docs[0].name).toBe('Dinamikus Dénes')
    expect(docs[0].email).toBe(DIN_EMAIL)
    expect((docs[0].data as Record<string, unknown>)['Csomag']).toBe('Prémium')
  })

  it('kötelező mező hiányát elutasítja (jelölőnégyzet is)', async () => {
    const alap = {
      'Név': 'X',
      'E-mail-cím': DIN_EMAIL,
      'Csomag': '',
      'Üzenet': '',
    }
    expect(
      (await submitDynamicForm({ formId, values: { ...alap, 'Elfogadom az adatkezelést': false } })).ok,
    ).toBe(false)
    expect(
      (
        await submitDynamicForm({
          formId,
          values: { ...alap, 'Név': '', 'Elfogadom az adatkezelést': true },
        })
      ).ok,
    ).toBe(false)
  })

  it('a legördülő csak a megengedett értékeket fogadja el', async () => {
    const result = await submitDynamicForm({
      formId,
      values: {
        'Név': 'X',
        'E-mail-cím': DIN_EMAIL,
        'Csomag': 'Hekkelt csomag',
        'Elfogadom az adatkezelést': true,
      },
    })
    expect(result.ok).toBe(false)
  })

  it('kitöltött honeypot esetén nem ment', async () => {
    const elotte = (await dinBekuldesek()).length
    const result = await submitDynamicForm({
      formId,
      values: { 'Név': 'Bot', 'E-mail-cím': DIN_EMAIL, 'Elfogadom az adatkezelést': true },
      website: 'spam.example.com',
    })
    expect(result.ok).toBe(true)
    expect((await dinBekuldesek()).length).toBe(elotte)
  })

  it('nem létező űrlapra hibát ad', async () => {
    expect((await submitDynamicForm({ formId: 999999, values: {} })).ok).toBe(false)
  })
})
