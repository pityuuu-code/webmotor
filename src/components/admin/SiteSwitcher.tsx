'use client'

import React, { useEffect, useState } from 'react'

/**
 * Oldalváltó az admin bal oldali sávjának tetején (multi-tenant).
 * A kiválasztott weboldalt sütiben tárolja; a listanézetek erre szűrnek
 * (siteBaseListFilter), és új tartalomnál ez lesz az alapértelmezett weboldal.
 */

const SITE_COOKIE = 'wm-site'

type SiteOption = { id: number; name: string }

function readCookie(): string {
  const match = document.cookie.match(/(?:^|;\s*)wm-site=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : ''
}

export function SiteSwitcher() {
  const [sites, setSites] = useState<SiteOption[]>([])
  const [value, setValue] = useState('')

  useEffect(() => {
    // A süti csak a kliensen olvasható, ezért a kezdőértéket hydration után,
    // effektben állítjuk – különben szerver/kliens eltérés lenne.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(readCookie())
    fetch('/api/sites?limit=100&depth=0&sort=name', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : { docs: [] }))
      .then((json) => {
        const docs = (json.docs ?? []) as SiteOption[]
        setSites(docs)
        // Ha a sütiben egy közben törölt weboldal azonosítója maradt, visszaállunk.
        const current = readCookie()
        if (current && current !== 'alap' && !docs.some((s) => String(s.id) === current)) {
          document.cookie = `${SITE_COOKIE}=; path=/; max-age=0`
          setValue('')
        }
      })
      .catch(() => setSites([]))
  }, [])

  // Egyetlen weboldal sincs felvéve → nincs mire váltani, nem jelenítünk meg semmit.
  if (sites.length === 0) return null

  const change = (next: string) => {
    setValue(next)
    document.cookie = `${SITE_COOKIE}=${encodeURIComponent(next)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    window.location.reload()
  }

  return (
    <div style={{ padding: '0 0 1rem' }}>
      <label
        htmlFor="wm-site-switcher"
        style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', opacity: 0.7 }}
      >
        Melyik weboldalon dolgozol?
      </label>
      <select
        id="wm-site-switcher"
        value={value}
        onChange={(event) => change(event.target.value)}
        style={{
          width: '100%',
          padding: '0.45rem 0.5rem',
          borderRadius: '4px',
          border: '1px solid var(--theme-elevation-150, #ccc)',
          background: 'var(--theme-input-bg, #fff)',
          color: 'inherit',
          font: 'inherit',
        }}
      >
        <option value="">Minden weboldal</option>
        <option value="alap">Alapértelmezett oldal</option>
        {sites.map((site) => (
          <option key={site.id} value={String(site.id)}>
            {site.name}
          </option>
        ))}
      </select>
    </div>
  )
}
