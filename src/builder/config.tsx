import type { Config } from '@measured/puck'
import Image from 'next/image'
import React from 'react'

import { ContactForm } from '../components/ContactForm'
import { FormRenderer } from '../components/FormRenderer'

/**
 * A vizuális oldalépítő (Puck) szekciókészlete.
 *
 * Minden szekció a témák CSS-változóit használja, ezért az itt összerakott
 * oldalak is automatikusan átöltöznek témaváltáskor.
 *
 * Új szekció hozzáadása: új bejegyzés a components objektumba (mezők + render),
 * és ha kell hozzá stílus, az a styles.css "Oldalépítő szekciók" részébe kerül.
 */

type MediaPick = {
  id: number
  alt: string
  url: string
  width?: number
  height?: number
}

/** Képválasztó a médiatárból – az oldalépítő "külső adat" mezője. */
const mediaField = {
  type: 'external' as const,
  placeholder: 'Kép kiválasztása a médiatárból…',
  showSearch: true,
  fetchList: async ({ query }: { query?: string }): Promise<MediaPick[]> => {
    const params = new URLSearchParams({ limit: '40', sort: '-createdAt', depth: '0' })
    if (query) params.set('where[alt][contains]', query)
    const res = await fetch(`/api/media?${params.toString()}`, { credentials: 'include' })
    if (!res.ok) return []
    const json = await res.json()
    type MediaApiDoc = {
      id: number
      alt: string
      url?: string
      width?: number
      height?: number
      sizes?: { card?: { url?: string; width?: number; height?: number } }
    }
    return ((json.docs ?? []) as MediaApiDoc[])
      .filter((doc) => Boolean(doc.url))
      .map((doc) => ({
        id: doc.id,
        alt: doc.alt,
        url: doc.sizes?.card?.url || (doc.url as string),
        width: doc.sizes?.card?.width || doc.width,
        height: doc.sizes?.card?.height || doc.height,
      }))
  },
  getItemSummary: (item: MediaPick) => item?.alt || 'Kép',
}

export const puckConfig: Config = {
  root: {
    render: ({ children }) => <div className="pb-root">{children}</div>,
  },

  components: {
    Hero: {
      label: 'Hero (nagy nyitó)',
      fields: {
        eyebrow: { type: 'text', label: 'Kis felcím' },
        heading: { type: 'text', label: 'Főcím' },
        lead: { type: 'textarea', label: 'Bevezető szöveg' },
      },
      defaultProps: {
        eyebrow: 'Üdvözlünk',
        heading: 'Ez itt a főcím',
        lead: 'Egy-két mondatos bevezető, ami elmondja, miről szól az oldal.',
      },
      render: ({ eyebrow, heading, lead }) => (
        <section className="hero">
          <div className="shell">
            {eyebrow && <p className="hero-eyebrow">{eyebrow}</p>}
            <h1>{heading}</h1>
            {lead && <p className="hero-lead">{lead}</p>}
          </div>
        </section>
      ),
    },

    Cimsor: {
      label: 'Címsor',
      fields: {
        text: { type: 'text', label: 'Szöveg' },
        size: {
          type: 'select',
          label: 'Méret',
          options: [
            { label: 'Nagy (H2)', value: 'h2' },
            { label: 'Kisebb (H3)', value: 'h3' },
          ],
        },
      },
      defaultProps: { text: 'Címsor', size: 'h2' },
      render: ({ text, size }) => (
        <div className="shell pb-text">{size === 'h3' ? <h3>{text}</h3> : <h2>{text}</h2>}</div>
      ),
    },

    Szoveg: {
      label: 'Szöveg',
      fields: {
        text: { type: 'textarea', label: 'Szöveg (üres sor = új bekezdés)' },
      },
      defaultProps: { text: 'Ide jön a bekezdés szövege.' },
      render: ({ text }) => (
        <div className="shell pb-text rich">
          {String(text ?? '')
            .split(/\n\s*\n/)
            .filter(Boolean)
            .map((par: string, i: number) => (
              <p key={i}>{par}</p>
            ))}
        </div>
      ),
    },

    Kep: {
      label: 'Kép',
      fields: {
        media: { ...mediaField, label: 'Kép' },
        caption: { type: 'text', label: 'Képaláírás' },
      },
      defaultProps: { media: null, caption: '' },
      render: ({ media, caption }) => {
        const pick = media as MediaPick | null
        if (!pick?.url) {
          return <div className="shell pb-text pb-placeholder">Válassz képet a bal oldali mezőben.</div>
        }
        return (
          <div className="shell pb-text">
            <figure className="b-image">
              <Image
                src={pick.url}
                alt={pick.alt || ''}
                width={pick.width || 960}
                height={pick.height || 640}
                sizes="(max-width: 720px) 100vw, 720px"
              />
              {caption && <figcaption>{caption}</figcaption>}
            </figure>
          </div>
        )
      },
    },

    Kartyak: {
      label: 'Kártyák (3 oszlop)',
      fields: {
        items: {
          type: 'array',
          label: 'Kártyák',
          getItemSummary: (item: { title?: string }) => item?.title || 'Kártya',
          arrayFields: {
            title: { type: 'text', label: 'Cím' },
            text: { type: 'textarea', label: 'Szöveg' },
          },
        },
      },
      defaultProps: {
        items: [
          { title: 'Első pont', text: 'Rövid leírás.' },
          { title: 'Második pont', text: 'Rövid leírás.' },
          { title: 'Harmadik pont', text: 'Rövid leírás.' },
        ],
      },
      render: ({ items }) => (
        <div className="shell">
          <div className="pb-columns">
            {(items as { title?: string; text?: string }[])?.map((item, i) => (
              <div key={i} className="pb-card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },

    Felhivas: {
      label: 'Felhívás (CTA)',
      fields: {
        heading: { type: 'text', label: 'Címsor' },
        text: { type: 'textarea', label: 'Szöveg' },
        buttonLabel: { type: 'text', label: 'Gomb felirata' },
        buttonUrl: { type: 'text', label: 'Gomb linkje' },
      },
      defaultProps: {
        heading: 'Készen állsz?',
        text: '',
        buttonLabel: 'Vedd fel velünk a kapcsolatot',
        buttonUrl: '/kapcsolat',
      },
      render: ({ heading, text, buttonLabel, buttonUrl }) => (
        <div className="shell pb-text">
          <aside className="b-cta">
            <h3>{heading}</h3>
            {text && <p>{text}</p>}
            <a className="button" href={buttonUrl || '#'}>
              {buttonLabel}
            </a>
          </aside>
        </div>
      ),
    },

    Video: {
      label: 'Videó (YouTube)',
      fields: {
        url: { type: 'text', label: 'YouTube link' },
        title: { type: 'text', label: 'Videó címe' },
      },
      defaultProps: { url: '', title: '' },
      render: ({ url, title }) => {
        const match = String(url ?? '').match(
          /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/,
        )
        const id = match?.[1]
        if (!id) {
          return <div className="shell pb-text pb-placeholder">Illessz be egy YouTube-linket.</div>
        }
        return (
          <div className="shell pb-text">
            <div className="b-video">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${id}`}
                title={title || 'Beágyazott videó'}
                allow="accelerometer; encrypted-media; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        )
      },
    },

    Arlista: {
      label: 'Árlista',
      fields: {
        heading: { type: 'text', label: 'Címsor' },
        items: {
          type: 'array',
          label: 'Csomagok',
          getItemSummary: (item: { name?: string }) => item?.name || 'Csomag',
          arrayFields: {
            name: { type: 'text', label: 'Csomag neve' },
            price: { type: 'text', label: 'Ár (pl. 29 900 Ft)' },
            period: { type: 'text', label: 'Időszak (pl. /hó) – üresen hagyható' },
            features: { type: 'textarea', label: 'Mit tartalmaz? (soronként egy pont)' },
            highlighted: {
              type: 'radio',
              label: 'Kiemelt csomag?',
              options: [
                { label: 'Nem', value: false },
                { label: 'Igen', value: true },
              ],
            },
            buttonLabel: { type: 'text', label: 'Gomb felirata – üresen nincs gomb' },
            buttonUrl: { type: 'text', label: 'Gomb linkje' },
          },
        },
      },
      defaultProps: {
        heading: 'Áraink',
        items: [
          {
            name: 'Alap',
            price: '29 900 Ft',
            period: '/hó',
            features: 'Első pont\nMásodik pont',
            highlighted: false,
            buttonLabel: 'Ezt választom',
            buttonUrl: '/kapcsolat',
          },
          {
            name: 'Népszerű',
            price: '49 900 Ft',
            period: '/hó',
            features: 'Minden az Alapból\nHarmadik pont\nNegyedik pont',
            highlighted: true,
            buttonLabel: 'Ezt választom',
            buttonUrl: '/kapcsolat',
          },
        ],
      },
      render: ({ heading, items }) => (
        <section className="shell b-pricing">
          {heading && <h2>{heading}</h2>}
          <div className="b-pricing-grid">
            {(
              items as {
                name?: string
                price?: string
                period?: string
                features?: string
                highlighted?: boolean
                buttonLabel?: string
                buttonUrl?: string
              }[]
            )?.map((item, i) => (
              <div key={i} className={`b-price-card${item.highlighted ? ' highlighted' : ''}`}>
                <h3>{item.name}</h3>
                <p className="b-price">
                  {item.price}
                  {item.period && <span className="b-price-period">{item.period}</span>}
                </p>
                <ul>
                  {String(item.features ?? '')
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line, j) => (
                      <li key={j}>{line}</li>
                    ))}
                </ul>
                {item.buttonLabel && (
                  <a className={`button${item.highlighted ? '' : ' ghost'}`} href={item.buttonUrl || '#'}>
                    {item.buttonLabel}
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      ),
    },

    Velemenyek: {
      label: 'Vélemények',
      fields: {
        heading: { type: 'text', label: 'Címsor' },
        items: {
          type: 'array',
          label: 'Vélemények',
          getItemSummary: (item: { name?: string }) => item?.name || 'Vélemény',
          arrayFields: {
            quote: { type: 'textarea', label: 'Idézet' },
            name: { type: 'text', label: 'Név' },
            role: { type: 'text', label: 'Titulus / cég – üresen hagyható' },
          },
        },
      },
      defaultProps: {
        heading: 'Ezt mondják rólunk',
        items: [
          { quote: 'Nagyon elégedettek vagyunk a közös munkával.', name: 'Minta Anna', role: 'ügyvezető, Minta Kft.' },
          { quote: 'Gyors, rugalmas, profi csapat.', name: 'Példa Péter', role: '' },
        ],
      },
      render: ({ heading, items }) => (
        <section className="shell b-quotes">
          {heading && <h2>{heading}</h2>}
          <div className="b-quotes-grid">
            {(items as { quote?: string; name?: string; role?: string }[])?.map((item, i) => (
              <figure key={i} className="b-quote">
                <blockquote>„{item.quote}”</blockquote>
                <figcaption>
                  <strong>{item.name}</strong>
                  {item.role && <span> – {item.role}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ),
    },

    Gyik: {
      label: 'GYIK (kérdések és válaszok)',
      fields: {
        heading: { type: 'text', label: 'Címsor' },
        items: {
          type: 'array',
          label: 'Kérdések',
          getItemSummary: (item: { question?: string }) => item?.question || 'Kérdés',
          arrayFields: {
            question: { type: 'text', label: 'Kérdés' },
            answer: { type: 'textarea', label: 'Válasz' },
          },
        },
      },
      defaultProps: {
        heading: 'Gyakori kérdések',
        items: [
          { question: 'Hogyan zajlik a közös munka?', answer: 'Ide jön a válasz.' },
          { question: 'Mennyi idő alatt készül el?', answer: 'Ide jön a válasz.' },
        ],
      },
      // A <details>/<summary> natív HTML: JavaScript nélkül is nyílik-csukódik.
      render: ({ heading, items }) => (
        <section className="shell pb-text b-faq">
          {heading && <h2>{heading}</h2>}
          {(items as { question?: string; answer?: string }[])?.map((item, i) => (
            <details key={i}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </section>
      ),
    },

    Kapcsolat: {
      label: 'Kapcsolatűrlap',
      fields: {
        heading: { type: 'text', label: 'Címsor' },
        text: { type: 'textarea', label: 'Bevezető szöveg – üresen hagyható' },
        successMessage: { type: 'text', label: 'Sikeres küldés üzenete' },
      },
      defaultProps: {
        heading: 'Írj nekünk!',
        text: '',
        successMessage: 'Köszönjük! Hamarosan válaszolunk.',
      },
      render: ({ heading, text, successMessage }) => (
        <section className="shell pb-text b-contact">
          {heading && <h2>{heading}</h2>}
          {text && <p>{text}</p>}
          <ContactForm successMessage={successMessage} />
        </section>
      ),
    },

    Urlap: {
      label: 'Űrlap (saját, összerakható)',
      fields: {
        heading: { type: 'text', label: 'Címsor – üresen hagyható' },
        form: {
          type: 'external' as const,
          label: 'Űrlap',
          placeholder: 'Űrlap kiválasztása…',
          showSearch: true,
          fetchList: async ({ query }: { query?: string }) => {
            const params = new URLSearchParams({ limit: '40', sort: 'name', depth: '0' })
            if (query) params.set('where[name][contains]', query)
            const res = await fetch(`/api/forms?${params.toString()}`, { credentials: 'include' })
            if (!res.ok) return []
            const json = await res.json()
            return ((json.docs ?? []) as { id: number; name: string }[]).map((doc) => ({
              id: doc.id,
              name: doc.name,
            }))
          },
          getItemSummary: (item: { name?: string }) => item?.name || 'Űrlap',
        },
      },
      defaultProps: { heading: '', form: null },
      render: ({ heading, form }) => {
        const picked = form as { id: number; name?: string } | null
        if (!picked?.id) {
          return (
            <div className="shell pb-text pb-placeholder">
              Válassz űrlapot a bal oldali mezőben. Űrlapot az Admin → Űrlapok alatt tudsz összerakni.
            </div>
          )
        }
        return (
          <section className="shell pb-text b-contact">
            {heading && <h2>{heading}</h2>}
            <FormRenderer formId={picked.id} />
          </section>
        )
      },
    },

    Terkoz: {
      label: 'Térköz',
      fields: {
        size: {
          type: 'select',
          label: 'Méret',
          options: [
            { label: 'Kicsi', value: 's' },
            { label: 'Közepes', value: 'm' },
            { label: 'Nagy', value: 'l' },
          ],
        },
      },
      defaultProps: { size: 'm' },
      render: ({ size }) => <div className={`pb-space pb-space-${size}`} aria-hidden="true" />,
    },
  },
}
