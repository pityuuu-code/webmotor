import type { Field, GlobalConfig } from 'payload'

import { revalidateSite } from '../hooks/revalidate'

/**
 * Menükezelő – a WordPress "Megjelenés → Menük" megfelelője.
 * A menüpontok sorrendje az adminban húzással (a bal oldali fogantyúval)
 * rendezhető át. Egy menüpont mutathat belső oldalra vagy tetszőleges URL-re.
 */
const menuArray = (name: 'header' | 'footer', label: string): Field => ({
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

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Menük',
  admin: {
    description:
      'Az oldal fejléc- és láblécmenüje. Ami itt nincs felvéve, az nem jelenik meg a menüben – a publikált oldalak persze linkről és a keresőből így is elérhetők.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [() => revalidateSite()],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        { label: 'Fejléc menü', fields: [menuArray('header', 'Fejléc menüpontok')] },
        { label: 'Lábléc menü', fields: [menuArray('footer', 'Lábléc menüpontok')] },
      ],
    },
  ],
}
