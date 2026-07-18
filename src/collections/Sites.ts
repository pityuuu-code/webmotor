import type { CollectionConfig } from 'payload'

import { adminOnly, hiddenFromClients } from '../access/roles'
import { menuArray } from '../fields/menu'
import { brandingFields, integrationFields, socialsGroup } from '../fields/siteBranding'

/**
 * Weboldalak (multi-tenant): egy motorból több, saját domainen futó oldal.
 *
 * Működés: a látogató kérésének domainje alapján a motor kikeresi az ide
 * felvett weboldalat, és annak beállításaival (név, téma, menük, mérőkódok)
 * + a hozzá rendelt tartalmakkal szolgálja ki az oldalt. Ha a domainhez nincs
 * bejegyzés, az ALAPÉRTELMEZETT oldal él: Oldalbeállítások + Menük globálok,
 * és azok a tartalmak, amiknél a "Weboldal" mező üres.
 */
export const Sites: CollectionConfig = {
  slug: 'sites',
  labels: { singular: 'Weboldal', plural: 'Weboldalak' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'theme'],
    description:
      'Több weboldal kiszolgálása egy motorból. A fő (alapértelmezett) oldalhoz NEM kell ide bejegyzés – azt az Oldalbeállítások és a Menük kezeli.',
    hidden: hiddenFromClients,
  },
  access: {
    // Nyilvános olvasás kell (a motor a domain alapján innen dolgozik);
    // módosítani csak ügynökség-admin tud – ügyfél a témához/mérőkódokhoz nem nyúlhat.
    read: () => true,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'name',
      label: 'Belső név',
      type: 'text',
      required: true,
      admin: { description: 'Csak az adminban látszik, pl. "Ügyfél Kft. honlapja".' },
    },
    {
      name: 'domains',
      label: 'Domainek',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Domain', plural: 'Domainek' },
      admin: {
        description:
          'Melyik domain(ek)en él ez az oldal – protokoll nélkül, pl. ugyfel.hu. Ha www-vel is használjátok, azt külön sorban vedd fel. Az első a fő domain: a sitemap és a canonical URL-ek erre épülnek.',
      },
      fields: [
        {
          name: 'domain',
          label: 'Domain',
          type: 'text',
          required: true,
          hooks: {
            beforeValidate: [
              ({ value }) =>
                typeof value === 'string'
                  ? value
                      .trim()
                      .toLowerCase()
                      .replace(/^https?:\/\//, '')
                      .replace(/\/.*$/, '')
                      .replace(/:\d+$/, '')
                  : value,
            ],
          },
        },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        { label: 'Általános', fields: brandingFields },
        { label: 'Mérés és integrációk', fields: integrationFields },
        { label: 'Közösségi média', fields: [socialsGroup] },
        {
          label: 'Menük',
          fields: [
            menuArray('header', 'Fejléc menüpontok'),
            menuArray('footer', 'Lábléc menüpontok'),
          ],
        },
      ],
    },
  ],
}
