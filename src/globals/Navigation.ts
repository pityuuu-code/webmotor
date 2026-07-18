import type { GlobalConfig } from 'payload'

import { adminOnly, hiddenFromClients } from '../access/roles'
import { menuArray } from '../fields/menu'
import { revalidateSite } from '../hooks/revalidate'

/**
 * Menükezelő – a WordPress "Megjelenés → Menük" megfelelője, az ALAPÉRTELMEZETT
 * weboldalhoz. (A Weboldalak alatt felvett további oldalak menüi ott, a
 * "Menük" fülön szerkeszthetők.)
 */
export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Menük',
  admin: {
    description:
      'Az oldal fejléc- és láblécmenüje. Ami itt nincs felvéve, az nem jelenik meg a menüben – a publikált oldalak persze linkről és a keresőből így is elérhetők.',
    hidden: hiddenFromClients,
  },
  access: {
    read: () => true,
    update: adminOnly,
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
