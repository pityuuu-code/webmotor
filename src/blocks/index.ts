import type { Block } from 'payload'

/**
 * A szerkesztőbe beszúrható elemek ("blokkok").
 *
 * A cikk tartalma egyetlen folyamatos szöveg (klasszikus szerkesztő), és ezeket
 * az elemeket a szövegen BELÜL lehet beszúrni a "/" menüből vagy az eszköztár
 * + gombjából. A sima kép és az idézet nem itt van: azok a szerkesztő beépített
 * funkciói (kép feltöltés, idézetblokk).
 *
 * Új elem hozzáadása:
 *  1. definiáld itt a mezőit, tedd be az embedBlocks tömbbe,
 *  2. vedd fel a típusát a src/lib/types.ts-ben,
 *  3. írj hozzá megjelenítőt a src/components/RichContent.tsx-ben.
 */

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: 'Galéria', plural: 'Galériák' },
  fields: [
    {
      name: 'images',
      label: 'Képek',
      type: 'array',
      minRows: 2,
      labels: { singular: 'Kép', plural: 'Képek' },
      fields: [
        {
          name: 'image',
          label: 'Kép',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
}

export const CtaBlock: Block = {
  slug: 'cta',
  labels: { singular: 'Felhívás (CTA)', plural: 'Felhívások (CTA)' },
  fields: [
    {
      name: 'heading',
      label: 'Címsor',
      type: 'text',
      required: true,
    },
    {
      name: 'text',
      label: 'Szöveg',
      type: 'textarea',
    },
    {
      name: 'buttonLabel',
      label: 'Gomb felirata',
      type: 'text',
      required: true,
    },
    {
      name: 'buttonUrl',
      label: 'Gomb linkje',
      type: 'text',
      required: true,
    },
  ],
}

export const VideoEmbedBlock: Block = {
  slug: 'videoEmbed',
  labels: { singular: 'Videó (YouTube)', plural: 'Videók' },
  fields: [
    {
      name: 'url',
      label: 'YouTube link',
      type: 'text',
      required: true,
      admin: {
        description: 'Pl. https://www.youtube.com/watch?v=XXXXXXXXXXX',
      },
    },
    {
      name: 'title',
      label: 'Videó címe (akadálymentesítéshez)',
      type: 'text',
    },
  ],
}

/** A szerkesztő "/" menüjében elérhető beszúrható elemek. */
export const embedBlocks: Block[] = [GalleryBlock, CtaBlock, VideoEmbedBlock]
