import '@measured/puck/puck.css'

import { Inter, Lora, Space_Grotesk } from 'next/font/google'
import React from 'react'

import { getSettings } from '@/lib/cms'

import '../(frontend)/styles.css'

const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter' })
const lora = Lora({ subsets: ['latin', 'latin-ext'], variable: '--font-lora' })
const grotesk = Space_Grotesk({ subsets: ['latin', 'latin-ext'], variable: '--font-grotesk' })

export const metadata = {
  title: 'Oldalépítő – Webmotor',
  robots: { index: false, follow: false },
}

/**
 * Az oldalépítő saját, teljes képernyős kerete: nincs oldalfejléc, lábléc,
 * mérőkód – csak a szerkesztő. A témát ugyanúgy az Oldalbeállítások adják,
 * így a vászonban pontosan azt látod, amit a látogató fog.
 */
export default async function BuilderLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()

  return (
    <html
      lang="hu"
      data-theme={settings.theme}
      className={`${inter.variable} ${lora.variable} ${grotesk.variable}`}
    >
      <body className="builder-body">{children}</body>
    </html>
  )
}
