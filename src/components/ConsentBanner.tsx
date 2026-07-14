'use client'

import React, { useEffect, useState } from 'react'

const COOKIE = 'wm_consent'

function readConsent(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function writeConsent(value: 'granted' | 'denied') {
  document.cookie = `${COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
}

function updateGtag(value: 'granted' | 'denied') {
  const w = window as unknown as { dataLayer?: unknown[] }
  w.dataLayer = w.dataLayer || []
  // eslint-disable-next-line prefer-rest-params
  function gtag(..._args: unknown[]) {
    // A GTM a dataLayer "arguments" objektumait várja, ezért nem spread-elünk.
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments)
  }
  gtag('consent', 'update', {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  })
  w.dataLayer.push({ event: value === 'granted' ? 'consent_granted' : 'consent_denied' })
}

/** Egyszerű, két gombos süti-sáv. Döntés után egy évig nem jelenik meg újra. */
export function ConsentBanner({ enabled }: { enabled: boolean }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const stored = readConsent()
    if (stored === 'granted' || stored === 'denied') {
      updateGtag(stored)
    } else {
      setVisible(true)
    }
  }, [enabled])

  if (!visible) return null

  const decide = (value: 'granted' | 'denied') => {
    writeConsent(value)
    updateGtag(value)
    setVisible(false)
  }

  return (
    <div className="consent" role="dialog" aria-label="Süti beállítások">
      <p>
        Sütiket használunk a látogatottság méréséhez és a hirdetések hatékonyságának követéséhez.
        A mérés csak elfogadás után indul el.
      </p>
      <div className="consent-actions">
        <button type="button" className="button" onClick={() => decide('granted')}>
          Elfogadom
        </button>
        <button type="button" className="button ghost" onClick={() => decide('denied')}>
          Csak a szükségesek
        </button>
      </div>
    </div>
  )
}
