import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import React from 'react'

import { FormRenderer } from '@/components/FormRenderer'
import {
  asDoc,
  type CtaEmbedData,
  type FormEmbedData,
  type GalleryEmbedData,
  type MediaDoc,
  type RichTextContent,
  type VideoEmbedData,
} from '@/lib/types'

/**
 * A tartalom-megjelenítő: a klasszikus szerkesztőben írt cikket HTML-lé
 * alakítja. A szokásos elemeket (bekezdés, címsor, lista, link, idézet)
 * a Payload beépített átalakítói kezelik – itt csak a saját beszúrható
 * elemeinket (galéria, CTA, videó) és a képek megjelenítését szabjuk testre.
 *
 * Új beszúrható elemnél: 1. src/blocks/index.ts  2. src/lib/types.ts  3. ide egy renderelő.
 */

function EmbeddedImage({ media, caption }: { media: MediaDoc | number | null | undefined; caption?: string | null }) {
  const doc = asDoc(media)
  if (!doc?.url) return null
  const variant = doc.sizes?.cover
  return (
    <figure className="b-image">
      <Image
        src={variant?.url || doc.url}
        alt={doc.alt}
        width={variant?.width || doc.width || 1600}
        height={variant?.height || doc.height || 900}
        sizes="(max-width: 720px) 100vw, 720px"
      />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

function youtubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/)
  return match?.[1] ?? null
}

const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,

  // Feltöltött kép a szövegben (a szerkesztő beépített kép-beszúrója)
  upload: ({ node }: { node: { value?: unknown } }) => {
    const value = node.value as MediaDoc | number
    return <EmbeddedImage media={value} />
  },

  // Saját beszúrható elemek
  blocks: {
    gallery: ({ node }: { node: { fields: unknown } }) => {
      const fields = node.fields as GalleryEmbedData
      return (
        <div className="b-gallery">
          {fields.images?.map((item, i) => {
            const doc = asDoc(item.image)
            if (!doc?.url) return null
            return (
              <figure key={item.id ?? i}>
                <Image
                  src={doc.sizes?.card?.url || doc.url}
                  alt={doc.alt}
                  width={doc.sizes?.card?.width || 960}
                  height={doc.sizes?.card?.height || 640}
                  sizes="(max-width: 720px) 50vw, 340px"
                />
              </figure>
            )
          })}
        </div>
      )
    },

    cta: ({ node }: { node: { fields: unknown } }) => {
      const fields = node.fields as CtaEmbedData
      return (
        <aside className="b-cta">
          <h3>{fields.heading}</h3>
          {fields.text && <p>{fields.text}</p>}
          <a className="button" href={fields.buttonUrl}>
            {fields.buttonLabel}
          </a>
        </aside>
      )
    },

    videoEmbed: ({ node }: { node: { fields: unknown } }) => {
      const fields = node.fields as VideoEmbedData
      const id = youtubeId(fields.url)
      if (!id) return null
      return (
        <div className="b-video">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            title={fields.title || 'Beágyazott videó'}
            allow="accelerometer; encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )
    },

    formEmbed: ({ node }: { node: { fields: unknown } }) => {
      const fields = node.fields as FormEmbedData
      const formId =
        typeof fields.form === 'number' ? fields.form : (fields.form as { id?: number })?.id
      if (!formId) return null
      return (
        <div className="b-contact">
          <FormRenderer formId={formId} />
        </div>
      )
    },
  },
})

export function RichContent({ data }: { data: RichTextContent }) {
  if (!data) return null
  return (
    <div className="rich">
      <RichText data={data as never} converters={jsxConverters} />
    </div>
  )
}
