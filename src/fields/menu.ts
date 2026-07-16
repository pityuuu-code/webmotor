import type { Field } from 'payload'

/**
 * Menüpont-lista mező (fejléc- vagy láblécmenü) – a WordPress
 * "Megjelenés → Menük" megfelelője. A Menük globál ÉS a Weboldalak
 * (multi-tenant) kollekció is ugyanezt használja.
 */
export const menuArray = (name: 'header' | 'footer', label: string): Field => ({
  name,
  label,
  type: 'array',
  labels: { singular: 'Menüpont', plural: 'Menüpontok' },
  admin: {
    description: 'Új menüpont a lenti gombbal, a sorrend a bal oldali fogantyúval húzva rendezhető.',
  },
  fields: [
    {
      name: 'label',
      label: 'Felirat',
      type: 'text',
      required: true,
    },
    {
      name: 'linkType',
      label: 'Hivatkozás típusa',
      type: 'radio',
      defaultValue: 'page',
      options: [
        { label: 'Belső oldal', value: 'page' },
        { label: 'Egyéni link (URL)', value: 'custom' },
      ],
    },
    {
      name: 'page',
      label: 'Oldal',
      type: 'relationship',
      relationTo: 'pages',
      admin: {
        condition: (_data, siblingData) => siblingData?.linkType !== 'custom',
      },
    },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      admin: {
        condition: (_data, siblingData) => siblingData?.linkType === 'custom',
        description: 'Pl. /kategoria/hirek vagy https://kulso-oldal.hu',
      },
    },
    {
      name: 'newTab',
      label: 'Új lapon nyíljon meg',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
})
