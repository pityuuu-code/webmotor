import type { GlobalConfig } from 'payload'

import { adminOnly, hiddenFromClients } from '../access/roles'
import { brandingFields, integrationFields, socialsGroup } from '../fields/siteBranding'
import { revalidateSite } from '../hooks/revalidate'

/** Az ALAPÉRTELMEZETT weboldal beállításai. További oldalak (multi-tenant): Admin → Weboldalak. */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Oldalbeállítások',
  admin: {
    description:
      'Az (alapértelmezett) oldal neve, aktív téma, mérőkódok és közösségi linkek – egy helyen. További, saját domainen futó oldalak a Weboldalak alatt vehetők fel.',
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
        { label: 'Általános', fields: brandingFields },
        { label: 'Mérés és integrációk', fields: integrationFields },
        { label: 'Közösségi média', fields: [socialsGroup] },
      ],
    },
  ],
}
