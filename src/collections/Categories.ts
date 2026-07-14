import type { CollectionConfig } from 'payload'

import { slugField } from '../fields/slug'
import { revalidateSite } from '../hooks/revalidate'

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
    afterChange: [() => revalidateSite()],
  },
  fields: [
    {
      name: 'name',
      label: 'Név',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      label: 'Leírás',
      type: 'textarea',
      admin: { description: 'A kategória-oldal bevezetője és meta leírása.' },
    },
    slugField('name'),
  ],
}
