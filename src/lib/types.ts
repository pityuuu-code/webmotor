/**
 * Kézzel írt, könnyűsúlyú domain-típusok a frontendhez.
 *
 * A Payload a `pnpm generate:types` paranccsal teljes típusokat generál a
 * src/payload-types.ts fájlba – hosszú távon érdemes azokra átállni. Ezek a
 * típusok addig is (és utána is) olvasható, stabil szerződést adnak a
 * frontend komponenseknek.
 */

export interface MediaDoc {
  id: number
  alt: string
  url?: string | null
  width?: number | null
  height?: number | null
  sizes?: {
    thumbnail?: { url?: string | null; width?: number | null; height?: number | null }
    card?: { url?: string | null; width?: number | null; height?: number | null }
    cover?: { url?: string | null; width?: number | null; height?: number | null }
    og?: { url?: string | null; width?: number | null; height?: number | null }
  }
}

export interface CategoryDoc {
  id: number
  name: string
  slug: string
  description?: string | null
}

export interface UserDoc {
  id: number
  name?: string | null
  email: string
}

export interface SeoGroup {
  metaTitle?: string | null
  metaDescription?: string | null
  ogImage?: MediaDoc | number | null
  canonicalUrl?: string | null
  noIndex?: boolean | null
}

/* --- A szerkesztőbe beszúrható elemek adatai --- */

/** A lexical blokk-node "fields" tartalma. */
interface EmbedBase {
  id?: string | null
  blockType: string
  blockName?: string | null
}

export interface GalleryEmbedData extends EmbedBase {
  blockType: 'gallery'
  images?: { id?: string | null; image: MediaDoc | number }[] | null
}

export interface CtaEmbedData extends EmbedBase {
  blockType: 'cta'
  heading: string
  text?: string | null
  buttonLabel: string
  buttonUrl: string
}

export interface VideoEmbedData extends EmbedBase {
  blockType: 'videoEmbed'
  url: string
  title?: string | null
}

/** A tartalommező lexical szerializált állapota – a RichContent komponens rendereli. */
export type RichTextContent = unknown

/* --- Dokumentumok --- */

export interface ArticleDoc {
  id: number
  title: string
  slug: string
  excerpt?: string | null
  coverImage?: MediaDoc | number | null
  content: RichTextContent
  category?: CategoryDoc | number | null
  author?: UserDoc | number | null
  publishedAt?: string | null
  updatedAt: string
  createdAt: string
  seo?: SeoGroup
}

export interface PageDoc {
  id: number
  title: string
  slug: string
  content?: RichTextContent
  editorMode?: 'richtext' | 'builder' | null
  /** A vizuális oldalépítő (Puck) által mentett elrendezés. */
  layout?: unknown
  updatedAt: string
  seo?: SeoGroup
}

export interface RedirectDoc {
  id: number
  from: string
  to: string
  permanent?: boolean | null
}

/** Feloldott menüpont a frontend számára. */
export interface NavLink {
  label: string
  href: string
  newTab?: boolean
}

export type ThemeName = 'folyoirat' | 'studio' | 'magazin'

export interface SiteSettingsDoc {
  siteName: string
  tagline?: string | null
  logo?: MediaDoc | number | null
  theme: ThemeName
  footerText?: string | null
  gtmId?: string | null
  searchConsoleVerification?: string | null
  socials?: {
    facebook?: string | null
    instagram?: string | null
    tiktok?: string | null
    linkedin?: string | null
    youtube?: string | null
    whatsapp?: string | null
  }
}

/** Segéd: relációs mező feloldása (a Payload számként adja vissza, ha nincs depth). */
export function asDoc<T>(value: T | number | null | undefined): T | null {
  if (value && typeof value === 'object') return value
  return null
}
