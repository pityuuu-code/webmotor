import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

import { submitContactMessage } from '@/lib/forms'

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
