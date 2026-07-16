import type { CollectionConfig } from 'payload'

/**
 * A kapcsolatűrlapon beküldött üzenetek. Csak a szerver hozhat létre bejegyzést
 * (a /api/kapcsolat végponton keresztül, spam-szűrés után) – a nyilvános REST
 * API-n nem lehet közvetlenül írni.
 */
export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  labels: { singular: 'Beérkezett üzenet', plural: 'Beérkezett üzenetek' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'createdAt'],
    description: 'A kapcsolatűrlapon beküldött üzenetek – a legfrissebb legfelül.',
  },
  access: {
    create: () => false,
    read: ({ req }) => Boolean(req.user),
    update: () => false,
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', label: 'Név', type: 'text', required: true },
    { name: 'email', label: 'E-mail-cím', type: 'email', required: true },
    { name: 'message', label: 'Üzenet', type: 'textarea', required: true },
    {
      name: 'path',
      label: 'Beküldő oldal',
      type: 'text',
      admin: { description: 'Melyik oldalon lévő űrlapról érkezett.' },
    },
  ],
}
