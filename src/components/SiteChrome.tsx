import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { asDoc, type ArticleDoc, type NavLink, type SiteSettingsDoc } from '@/lib/types'

/** Fejléc: logó/oldalnév + az Admin → Menük alatt összeállított fejlécmenü. */
export function SiteHeader({
  settings,
  navItems,
}: {
  settings: SiteSettingsDoc
  navItems: NavLink[]
}) {
  const logo = asDoc(settings.logo)
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="brand" aria-label={settings.siteName}>
          {logo?.url ? (
            <Image
              src={logo.url}
              alt={settings.siteName}
              width={logo.width || 140}
              height={logo.height || 36}
              style={{ height: 36, width: 'auto' }}
              priority
            />
          ) : (
            <span className="brand-name">{settings.siteName}</span>
          )}
        </Link>
        <nav aria-label="Fő navigáció">
          {navItems.map((item) => (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              target={item.newTab ? '_blank' : undefined}
              rel={item.newTab ? 'noopener noreferrer' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

const SOCIAL_LABELS: [key: keyof NonNullable<SiteSettingsDoc['socials']>, label: string][] = [
  ['facebook', 'Facebook'],
  ['instagram', 'Instagram'],
  ['tiktok', 'TikTok'],
  ['linkedin', 'LinkedIn'],
  ['youtube', 'YouTube'],
]

/** Lábléc: szabad szöveg + láblécmenü + közösségi linkek. */
export function SiteFooter({
  settings,
  navItems,
}: {
  settings: SiteSettingsDoc
  navItems: NavLink[]
}) {
  const socials = settings.socials
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <p className="brand-name">{settings.siteName}</p>
          {settings.footerText && <p className="footer-text">{settings.footerText}</p>}
        </div>
        {navItems.length > 0 && (
          <nav className="footer-nav" aria-label="Lábléc menü">
            {navItems.map((item) => (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                target={item.newTab ? '_blank' : undefined}
                rel={item.newTab ? 'noopener noreferrer' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
        <div className="footer-socials">
          {SOCIAL_LABELS.map(([key, label]) => {
            const url = socials?.[key]
            if (!url) return null
            return (
              <a key={key} href={url} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            )
          })}
        </div>
      </div>
    </footer>
  )
}

/** Lebegő WhatsApp click-to-chat gomb – csak akkor, ha van szám megadva. */
export function WhatsAppButton({ phone }: { phone?: string | null }) {
  if (!phone) return null
  const clean = phone.replace(/\D/g, '')
  return (
    <a
      className="whatsapp-button"
      href={`https://wa.me/${clean}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Írj nekünk WhatsAppon"
    >
      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="currentColor">
        <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.96L2 22l5.18-1.5A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.07.89.9-3-.2-.31a8.2 8.2 0 1 1 6.85 3.75Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.22-.09-.39-.13-.55.12-.16.25-.63.8-.77.96-.14.17-.29.19-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.22-1.45-1.37-1.7-.14-.24-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.55-.43h-.47c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.04 0 1.2.88 2.37 1 2.53.12.17 1.72 2.63 4.18 3.69.58.25 1.04.4 1.4.51.59.19 1.12.16 1.54.1.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.14-1.17-.06-.1-.22-.17-.47-.29Z" />
      </svg>
    </a>
  )
}

/** Cikk-kártya a listaoldalakra (főoldal, kategória). */
export function ArticleCard({ article }: { article: ArticleDoc }) {
  const cover = asDoc(article.coverImage)
  const category = asDoc(article.category)
  const date = article.publishedAt
    ? new Intl.DateTimeFormat('hu-HU', { dateStyle: 'long' }).format(new Date(article.publishedAt))
    : null

  return (
    <article className="card">
      {cover?.url && (
        <Link href={`/cikk/${article.slug}`} className="card-media" tabIndex={-1}>
          <Image
            src={cover.sizes?.card?.url || cover.url}
            alt={cover.alt}
            width={cover.sizes?.card?.width || 960}
            height={cover.sizes?.card?.height || 640}
            sizes="(max-width: 720px) 100vw, 420px"
          />
        </Link>
      )}
      <div className="card-body">
        {category && (
          <Link className="kicker" href={`/kategoria/${category.slug}`}>
            {category.name}
          </Link>
        )}
        <h2>
          <Link href={`/cikk/${article.slug}`}>{article.title}</Link>
        </h2>
        {article.excerpt && <p>{article.excerpt}</p>}
        {date && <time dateTime={article.publishedAt ?? undefined}>{date}</time>}
      </div>
    </article>
  )
}
