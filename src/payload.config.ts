import { postgresAdapter } from '@payloadcms/db-postgres'
import { BlocksFeature, FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
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

// S3-kompatibilis médiatárolás: csak akkor kapcsol be, ha a hozzáférési adatok
// meg vannak adva (.env). Nélkülük a képek a helyi fájlrendszerre kerülnek,
// így a fejlesztés változatlanul, S3 nélkül is működik.
const s3Enabled = Boolean(
  process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY,
)

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
    // Éles migrációk helye (pnpm migrate:create / pnpm migrate).
    // Fejlesztésben marad a "push" mód: a táblákat a Payload automatikusan szinkronban tartja.
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [
    s3Storage({
      enabled: s3Enabled,
      // A prefix-mező akkor is része a sémának, ha az S3 ki van kapcsolva —
      // így a helyi és az éles adatbázis szerkezete azonos (migrációk!).
      alwaysInsertFields: true,
      collections: {
        media: { prefix: 'media' },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        region: process.env.S3_REGION || 'auto',
        // Csak S3-kompatibilis tárolónál kell (Cloudflare R2, MinIO, Supabase…);
        // valódi AWS S3-nál hagyd üresen az S3_ENDPOINT-ot.
        ...(process.env.S3_ENDPOINT
          ? { endpoint: process.env.S3_ENDPOINT, forcePathStyle: true }
          : {}),
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
})
