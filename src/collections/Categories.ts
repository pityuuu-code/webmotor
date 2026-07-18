import type { CollectionConfig } from 'payload'

import {
  contentCreateAccess,
  contentMutateAccess,
  contentReadAccess,
  forceClientSite,
} from '../access/roles'
import { siteField } from '../fields/site'
import { slugField } from '../fields/slug'
import { revalidateSite } from '../hooks/revalidate'
import { siteBaseListFilter } from '../hooks/siteListFilter'
import { uniqueFieldPerSite } from '../hooks/uniqueFieldPerSite'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Kategória', plural: 'Kategóriák' },
  admin: {
    useAsTitle: 'name',
    description: 'A cikkek témakörei – minden kategória saját listaoldalt kap (/kategoria/slug).',
    baseListFilter: siteBaseListFilter,
  },
  access: {
    read: contentReadAccess(),
    create: contentCreateAccess,
    update: contentMutateAccess,
    delete: contentMutateAccess,
  },
  hooks: {
    beforeValidate: [uniqueFieldPerSite('categories', 'slug', 'URL (slug)')],
    beforeChange: [forceClientSite],
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
