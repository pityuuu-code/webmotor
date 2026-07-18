import type { CollectionConfig } from 'payload'

import { isAdminUser, userSiteWhere } from '../access/roles'
import { siteBaseListFilter } from '../hooks/siteListFilter'

/**
 * 404-napló: milyen nem létező címeket találgatnak a látogatók (vagy hova
 * mutatnak elavult külső linkek). SEO-aranybánya: ha egy sokszor eltalált
 * címre van értelmes cél, vedd fel átirányításnak az Átirányítások alatt.
 * A bejegyzéseket a motor írja; kézzel csak törölni lehet.
 */
export const NotFoundLog: CollectionConfig = {
  slug: 'not-found-log',
  labels: { singular: '404-találat', plural: '404-napló' },
  admin: {
    useAsTitle: 'path',
    defaultColumns: ['path', 'count', 'lastSeenAt', 'site'],
    description:
      'Nem létező címek, amikre látogató érkezett – a leggyakoribbakra érdemes átirányítást felvenni. A lista magától gyűlik.',
    baseListFilter: siteBaseListFilter,
  },
  defaultSort: '-lastSeenAt',
  access: {
    create: () => false,
    update: () => false,
    read: ({ req: { user } }) =>
      !user ? false : isAdminUser(user) ? true : userSiteWhere(user),
    delete: ({ req: { user } }) =>
      !user ? false : isAdminUser(user) ? true : userSiteWhere(user),
  },
  fields: [
    { name: 'path', label: 'Útvonal', type: 'text', required: true, index: true },
    {
      name: 'count',
      label: 'Találatok száma',
      type: 'number',
      defaultValue: 1,
      admin: { description: 'Hányszor futott erre a címre látogató.' },
    },
    { name: 'lastSeenAt', label: 'Utolsó találat', type: 'date' },
    {
      name: 'site',
      label: 'Weboldal',
      type: 'relationship',
      relationTo: 'sites',
      index: true,
      admin: { position: 'sidebar' },
    },
  ],
}
