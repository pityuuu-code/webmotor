import type { CollectionConfig } from 'payload'

import {
  contentCreateAccess,
  contentMutateAccess,
  contentReadAccess,
  forceClientSite,
} from '../access/roles'
import { seoFields } from '../fields/seo'
import { siteField } from '../fields/site'
import { slugField } from '../fields/slug'
import { autoRedirectOnSlugChange } from '../hooks/autoRedirect'
import { revalidateSite } from '../hooks/revalidate'
import { siteBaseListFilter } from '../hooks/siteListFilter'
import { uniqueFieldPerSite } from '../hooks/uniqueFieldPerSite'

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Cikk', plural: 'Cikkek' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'author', 'publishedAt', '_status'],
    listSearchableFields: ['title', 'slug', 'excerpt'],
    baseListFilter: siteBaseListFilter,
    description: 'Blogcikkek és hírek. A publikált cikk a /cikk/slug címen jelenik meg, kinézetét az aktív téma adja.',
    preview: (doc) => {
      const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
      const slug = typeof doc?.slug === 'string' ? doc.slug : ''
      return `${base}/next/preview?path=${encodeURIComponent(`/cikk/${slug}`)}`
    },
  },
  versions: {
    drafts: { autosave: { interval: 800 } },
    maxPerDoc: 25,
  },
  access: {
    // Látogató: csak publikált. Admin: minden. Ügyfél-szerkesztő: a saját weboldala.
    read: contentReadAccess({ publicPublishedOnly: true }),
    create: contentCreateAccess,
    update: contentMutateAccess,
    delete: contentMutateAccess,
  },
  hooks: {
    beforeValidate: [
      uniqueFieldPerSite('articles', 'slug', 'URL (slug)', { autoSuffixOnCreate: true }),
    ],
    beforeChange: [
      forceClientSite,
      ({ data }) => {
        if (data?._status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }
        return data
      },
    ],
    afterChange: [autoRedirectOnSlugChange('/cikk'), () => revalidateSite()],
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
      name: 'excerpt',
      label: 'Kivonat',
      type: 'textarea',
      maxLength: 300,
      admin: {
        description:
          'Rövid összefoglaló a listaoldalakra – és ha nincs külön meta leírás, a Google is ezt kapja.',
      },
    },
    {
      name: 'coverImage',
      label: 'Borítókép',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'A cikk fejléce és a kártyák képe. Ajánlott: legalább 1200 px széles.' },
    },
    {
      name: 'content',
      label: 'Tartalom',
      type: 'richText',
      required: true,
      admin: {
        description:
          'Klasszikus szerkesztő: fenti eszköztár + "/" jellel beszúró menü (kép, galéria, videó, CTA, idézet). Címsorokat H2-től lefelé használj – a H1 a cikk címe.',
      },
    },
    // --- Oldalsáv ---
    slugField('title'),
    siteField,
    {
      name: 'category',
      label: 'Kategória',
      type: 'relationship',
      relationTo: 'categories',
      admin: { position: 'sidebar' },
    },
    {
      name: 'author',
      label: 'Szerző',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar' },
      defaultValue: ({ user }) => user?.id,
    },
    {
      name: 'publishedAt',
      label: 'Publikálás dátuma',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description:
          'Üresen hagyva az első publikáláskor automatikusan kitöltődik. IDŐZÍTÉS: állíts be jövőbeli időpontot és kattints a Közzétételre – a cikk magától ekkor jelenik meg az oldalon.',
      },
    },
    // --- SEO fül tartalma ---
    seoFields,
  ],
}
