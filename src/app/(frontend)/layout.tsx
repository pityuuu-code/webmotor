import type { Metadata } from 'next'
import { Inter, Lora, Space_Grotesk } from 'next/font/google'
import React from 'react'

import { ConsentBanner } from '@/components/ConsentBanner'
import { Gtm } from '@/components/Gtm'
import { SiteFooter, SiteHeader, WhatsAppButton } from '@/components/SiteChrome'
import { getBaseURL, getNavigation, getSettings } from '@/lib/cms'

import './styles.css'

/*
 * A három betűtípust egyszer töltjük be, CSS-változóként tesszük elérhetővé,
 * és az aktív téma dönti el, melyiket mire használja (styles.css).
 * A latin-ext készlet kell a magyar ő/ű betűkhöz.
 */
const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter' })
const lora = Lora({ subsets: ['latin', 'latin-ext'], variable: '--font-lora' })
const grotesk = Space_Grotesk({ subsets: ['latin', 'latin-ext'], variable: '--font-grotesk' })

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  return {
    metadataBase: new URL(await getBaseURL()),
    title: {
      default: settings.tagline ? `${settings.siteName} – ${settings.tagline}` : settings.siteName,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.tagline || undefined,
    verification: settings.searchConsoleVerification
      ? { google: settings.searchConsoleVerification }
      : undefined,
    openGraph: { siteName: settings.siteName, locale: 'hu_HU', type: 'website' },
  }
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [settings, nav] = await Promise.all([getSettings(), getNavigation()])

  return (
    <html
      lang="hu"
      data-theme={settings.theme}
      className={`${inter.variable} ${lora.variable} ${grotesk.variable}`}
    >
      <body>
        <Gtm gtmId={settings.gtmId} />
        <SiteHeader settings={settings} navItems={nav.header} />
        <main id="tartalom">{children}</main>
        <SiteFooter settings={settings} navItems={nav.footer} />
        <WhatsAppButton phone={settings.socials?.whatsapp} />
        <ConsentBanner enabled={Boolean(settings.gtmId)} />
      </body>
    </html>
  )
}
