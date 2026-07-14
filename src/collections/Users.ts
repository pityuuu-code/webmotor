import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Felhasználó', plural: 'Felhasználók' },
  admin: {
    useAsTitle: 'name',
    description: 'Az admin felület felhasználói. A cikkeknél szerzőként is megjelennek.',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      label: 'Név',
      type: 'text',
      required: true,
      admin: { description: 'A cikkek szerzőjeként ez a név jelenik meg az oldalon.' },
    },
  ],
}
