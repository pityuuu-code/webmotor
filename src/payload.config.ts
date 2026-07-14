import { postgresAdapter } from '@payloadcms/db-postgres'
import { BlocksFeature, FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { hu } from '@payloadcms/translations/languages/hu'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { embedBlocks } from './blocks'
import { Articles } from './collections/Articles'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Redirects } from './collections/Redirects'
import { Users } from './collections/Users'
import { Navigation } from './globals/Navigation'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  // Szándékosan NINCS serverURL megadva: így a Payload a képeket relatív
  // útvonallal adja vissza (/api/media/...), ami minden domainen működik,
  // és a Next képkiszolgálójának nem kell hozzá hoszt-engedélylista.
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' – Webmotor admin',
    },
    // Élő előnézet: a szerkesztő írás közben, oldalt látja a tartalmat az aktív témával.
    livePreview: {
      url: ({ data, collectionConfig }) => {
        const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
        const slug = typeof data?.slug === 'string' && data.slug ? data.slug : ''
        const path = collectionConfig?.slug === 'articles' ? `/cikk/${slug}` : `/${slug}`
        return `${base}/next/preview?path=${encodeURIComponent(path)}`
      },
      collections: ['articles', 'pages'],
      breakpoints: [
        { label: 'Mobil', name: 'mobile', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 834, height: 1112 },
        { label: 'Asztali', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  // Az admin felület nyelve: magyar, angol fallbackkel.
  i18n: {
    fallbackLanguage: 'hu',
    supportedLanguages: { hu, en },
  },
  collections: [Articles, Pages, Categories, Media, Users, Redirects],
  globals: [SiteSettings, Navigation],
  // Klasszikus, WordPress-szerű szövegszerkesztő minden richText mezőben:
  // állandó eszköztár felül + a "/" beszúró menüben elérhető saját elemek.
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(),
      BlocksFeature({ blocks: embedBlocks }),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
