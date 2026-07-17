import type { CollectionConfig } from 'payload'

import { siteBaseListFilter } from '../hooks/siteListFilter'

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
    defaultColumns: ['name', 'email', 'site', 'createdAt'],
    description: 'A kapcsolatűrlapon beküldött üzenetek – a legfrissebb legfelül.',
    baseListFilter: siteBaseListFilter,
  },
  access: {
    create: () => false,
    read: ({ req }) => Boolean(req.user),
    update: () => false,
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', label: 'Név', type: 'text' },
    { name: 'email', label: 'E-mail-cím', type: 'email' },
    { name: 'message', label: 'Üzenet', type: 'textarea' },
    {
      // Az űrlap-építős beküldések minden mezője itt van (felirat → érték).
      name: 'data',
      label: 'Beküldött adatok',
      type: 'json',
      admin: { description: 'Az űrlap összes mezője és a beküldött értékek.' },
    },
    {
      name: 'form',
      label: 'Űrlap',
      type: 'relationship',
      relationTo: 'forms',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Melyik űrlapról érkezett. Üres = a beépített kapcsolatűrlapról.',
      },
    },
    {
      name: 'path',
      label: 'Beküldő oldal',
      type: 'text',
      admin: { description: 'Melyik oldalon lévő űrlapról érkezett.' },
    },
    {
      // A beküldés domainje alapján automatikusan töltődik (multi-tenant).
      name: 'site',
      label: 'Weboldal',
      type: 'relationship',
      relationTo: 'sites',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Melyik weboldal űrlapjáról érkezett. Üres = alapértelmezett oldal.',
      },
    },
  ],
}
