import type { CollectionConfig } from 'payload'

import { adminOnlyField, isAdminUser } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Felhasználó', plural: 'Felhasználók' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'site'],
    description:
      'Az admin felület felhasználói. Ügynökség-admin: mindent lát. Ügyfél-szerkesztő: csak a hozzárendelt weboldal tartalmát szerkesztheti.',
  },
  auth: true,
  access: {
    // Admin mindenkit; ügyfél-szerkesztő csak saját magát (jelszócseréhez).
    read: ({ req: { user } }) =>
      isAdminUser(user) ? true : user ? { id: { equals: user.id } } : false,
    update: ({ req: { user } }) =>
      isAdminUser(user) ? true : user ? { id: { equals: user.id } } : false,
    create: ({ req }) => isAdminUser(req.user),
    delete: ({ req }) => isAdminUser(req.user),
  },
  fields: [
    {
      name: 'name',
      label: 'Név',
      type: 'text',
      required: true,
      admin: { description: 'A cikkek szerzőjeként ez a név jelenik meg az oldalon.' },
    },
    {
      name: 'role',
      label: 'Szerepkör',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      options: [
        { label: 'Ügynökség-admin (mindent lát és szerkeszt)', value: 'admin' },
        { label: 'Ügyfél-szerkesztő (csak a saját weboldala tartalmát)', value: 'client' },
      ],
      // A szerepét senki nem állíthatja át magának – csak admin.
      access: { create: adminOnlyField, update: adminOnlyField },
      admin: { position: 'sidebar' },
    },
    {
      name: 'site',
      label: 'Weboldal (ügyfél-szerkesztőnél)',
      type: 'relationship',
      relationTo: 'sites',
      access: { create: adminOnlyField, update: adminOnlyField },
      admin: {
        position: 'sidebar',
        condition: (data) => data?.role === 'client',
        description:
          'Melyik weboldal tartalmát szerkesztheti. Üresen hagyva az alapértelmezett oldalét.',
      },
    },
  ],
}
