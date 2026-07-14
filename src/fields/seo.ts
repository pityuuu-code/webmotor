import type { Field } from 'payload'

/**
 * SEO mezőcsoport – minden cikk és oldal "SEO" fülön kapja meg.
 * A frontend a generateMetadata()-ban ezekből állítja elő a meta tageket,
 * az Open Graph adatokat és a canonical URL-t.
 */
export const seoFields: Field = {
  name: 'seo',
  label: 'SEO',
  type: 'group',
  admin: {
    description:
      'Keresőoptimalizálási beállítások. Üresen hagyott mezők esetén a motor értelmes alapértékeket használ (cím, kivonat, borítókép).',
  },
  fields: [
    {
      name: 'metaTitle',
      label: 'Meta cím',
      type: 'text',
      maxLength: 70,
      admin: {
        description: 'A Google találati listában megjelenő cím. Ideális hossz: 50–60 karakter.',
      },
    },
    {
      name: 'metaDescription',
      label: 'Meta leírás',
      type: 'textarea',
      maxLength: 170,
      admin: {
        description:
          'A találati listában megjelenő leírás. Ideális hossz: 140–160 karakter, tartalmazza a fő kulcsszót.',
      },
    },
    {
      name: 'ogImage',
      label: 'Megosztási kép (Open Graph)',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Facebook/LinkedIn/WhatsApp megosztáskor megjelenő kép. Ajánlott méret: 1200×630 px. Ha üres, a borítókép lesz.',
      },
    },
    {
      name: 'canonicalUrl',
      label: 'Canonical URL',
      type: 'text',
      admin: {
        description:
          'Csak akkor töltsd ki, ha a tartalom máshol jelent meg eredetileg, és arra szeretnél mutatni.',
      },
    },
    {
      name: 'noIndex',
      label: 'Kizárás a keresőkből (noindex)',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Bepipálva a Google nem indexeli ezt a tartalmat.',
      },
    },
  ],
}
