'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import React from 'react'

/**
 * Az admin élő előnézetének "füle": amikor a szerkesztőben változik a tartalom
 * (a Payload 0,8 mp-enként automatikusan ment), az admin szól ennek a
 * komponensnek, ami újratölti a szerveroldali tartalmat – így az előnézet
 * kb. egy másodperces késéssel követi a gépelést.
 */
export function LivePreviewListener() {
  const router = useRouter()
  return (
    <RefreshRouteOnSave
      refresh={() => router.refresh()}
      serverURL={process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}
    />
  )
}

/** Jelzősáv, hogy éppen vázlat-előnézetet látsz – kilépési linkkel. */
export function DraftBar() {
  return (
    <div className="draft-bar">
      <span>Vázlat-előnézetet látsz – ez a változat még nincs publikálva.</span>
      <a href="/next/exit-preview">Kilépés az előnézetből</a>
    </div>
  )
}
