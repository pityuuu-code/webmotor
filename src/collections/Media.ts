import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Médiafájl', plural: 'Médiatár' },
  admin: {
    description:
      'Feltöltéskor a motor automatikusan legenerálja a szükséges képméreteket (kártya, borító, megosztási kép).',
  },
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ['image/*'],
    focalPoint: true,
    adminThumbnail: 'thumbnail',
    imageSizes: [
      { name: 'thumbnail', width: 480, height: undefined, position: 'centre' },
      { name: 'card', width: 960, height: 640, position: 'centre' },
      { name: 'cover', width: 1600, height: undefined, position: 'centre' },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
  },
  fields: [
    {
      name: 'alt',
      label: 'Alt szöveg',
      type: 'text',
      required: true,
      admin: {
        description:
          'A kép rövid leírása. Fontos a SEO-hoz és a képernyőolvasót használóknak – írd le, mi látható a képen.',
      },
    },
  ],
}
