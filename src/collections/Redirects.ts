import type { CollectionConfig } from 'payload'

import { siteField } from '../fields/site'
import { uniqueFieldPerSite } from '../hooks/uniqueFieldPerSite'

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  labels: { singular: 'Átirányítás', plural: 'Átirányítások' },
  admin: {
    useAsTitle: 'from',
    description:
      'SEO-létfontosságú: ha egy cikk URL-je megváltozik, itt vedd fel a régi címet, hogy a Google-ranking ne vesszen el.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [uniqueFieldPerSite('redirects', 'from', 'régi útvonal')],
  },
  fields: [
    {
      name: 'from',
      label: 'Régi útvonal',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'Perjellel kezdődő útvonal, pl. /cikk/regi-cim' },
    },
    {
      name: 'to',
      label: 'Új cím',
      type: 'text',
      required: true,
      admin: { description: 'Útvonal (/cikk/uj-cim) vagy teljes URL (https://...)' },
    },
    {
      name: 'permanent',
      label: 'Végleges (301)',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Bepipálva 301-es (végleges), kipipálva 307-es (ideiglenes) átirányítás.' },
    },
    siteField,
  ],
}
