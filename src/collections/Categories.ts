import type { CollectionConfig } from 'payload'

import { siteField } from '../fields/site'
import { slugField } from '../fields/slug'
import { revalidateSite } from '../hooks/revalidate'
import { uniqueFieldPerSite } from '../hooks/uniqueFieldPerSite'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Kategória', plural: 'Kategóriák' },
  admin: {
    useAsTitle: 'name',
    description: 'A cikkek témakörei – minden kategória saját listaoldalt kap (/kategoria/slug).',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [uniqueFieldPerSite('categories', 'slug', 'URL (slug)')],
    afterChange: [() => revalidateSite()],
  },
  fields: [
    {
      name: 'name',
      label: 'Név',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      label: 'Leírás',
      type: 'textarea',
      admin: { description: 'A kategória-oldal bevezetője és meta leírása.' },
    },
    slugField('name'),
    siteField,
  ],
}
