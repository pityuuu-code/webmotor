import type { CollectionConfig } from 'payload'

import { seoFields } from '../fields/seo'
import { siteField } from '../fields/site'
import { slugField } from '../fields/slug'
import { revalidateSite } from '../hooks/revalidate'
import { siteBaseListFilter } from '../hooks/siteListFilter'
import { uniqueFieldPerSite } from '../hooks/uniqueFieldPerSite'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Oldal', plural: 'Oldalak' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'editorMode', '_status'],
    baseListFilter: siteBaseListFilter,
    description:
      'Statikus oldalak: rólunk, kapcsolat, impresszum stb. A publikált oldal a /slug címen érhető el; a menübe az Admin → Menük alatt teheted ki.',
    preview: (doc) => {
      const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
      const slug = typeof doc?.slug === 'string' ? doc.slug : ''
      return `${base}/next/preview?path=${encodeURIComponent(`/${slug}`)}`
    },
  },
  versions: {
    drafts: { autosave: { interval: 800 } },
    maxPerDoc: 25,
  },
  access: {
    read: ({ req: { user } }) => (user ? true : { _status: { equals: 'published' } }),
  },
  hooks: {
    beforeValidate: [uniqueFieldPerSite('pages', 'slug', 'URL (slug)')],
    afterChange: [() => revalidateSite()],
    afterDelete: [() => revalidateSite()],
  },
  fields: [
    {
      name: 'title',
      label: 'Cím',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      label: 'Tartalom',
      type: 'richText',
      admin: {
        description:
          'Klasszikus szerkesztő: fenti eszköztár + "/" jellel beszúró menü (kép, galéria, videó, CTA, idézet).',
        condition: (data) => data?.editorMode !== 'builder',
      },
    },
    {
      // A vizuális oldalépítő (Puck) ide menti az elrendezést – kézzel nem kell szerkeszteni.
      name: 'layout',
      type: 'json',
      admin: { hidden: true },
    },
    slugField('title'),
    siteField,
    {
      name: 'editorMode',
      label: 'Szerkesztési mód',
      type: 'select',
      required: true,
      defaultValue: 'richtext',
      options: [
        { label: 'Szövegszerkesztő (cikkszerű oldal)', value: 'richtext' },
        { label: 'Vizuális oldalépítő (szekciókból, húzd és ejtsd)', value: 'builder' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Oldalépítő módban a tartalmat a /builder címen szerkesztheted (pl. http://localhost:3000/builder).',
      },
    },
    seoFields,
  ],
}
