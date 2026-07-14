import config from '@payload-config'
import Link from 'next/link'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import type { PageDoc } from '@/lib/types'

export const dynamic = 'force-dynamic'

/**
 * /builder – az oldalépítő nyitóoldala.
 * Csak bejelentkezett szerkesztőknek: felsorolja az oldalakat, és innen
 * nyitható meg a húzd-és-ejtsd szerkesztő. Új oldalt az adminban hozz létre
 * (Oldalak → Új létrehozása), "Vizuális oldalépítő" módban.
 */
export default async function BuilderIndexPage() {
  const payload = await getPayload({ config })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })
  if (!user) redirect('/admin')

  const result = await payload.find({
    collection: 'pages' as never,
    draft: true,
    limit: 100,
    depth: 0,
    sort: 'title',
  })
  const pages = result.docs as unknown as (PageDoc & { id: number })[]

  return (
    <main className="shell builder-index">
      <h1>Oldalépítő</h1>
      <p className="builder-hint">
        Válaszd ki a szerkeszteni kívánt oldalt. Új oldalt az <a href="/admin/collections/pages">
        admin felületen</a> hozhatsz létre – a jobb oldali sávban állítsd a szerkesztési módot
        „Vizuális oldalépítő”-re.
      </p>

      {pages.length === 0 ? (
        <div className="empty">
          <h2>Még nincs egyetlen oldal sem</h2>
          <p>
            Hozz létre egyet az <a href="/admin/collections/pages/create">adminban</a>, aztán gyere
            vissza ide.
          </p>
        </div>
      ) : (
        <ul className="builder-list">
          {pages.map((page) => (
            <li key={page.id}>
              <div>
                <strong>{page.title}</strong>
                <span className="builder-slug">/{page.slug}</span>
              </div>
              <div className="builder-actions">
                <span className={`builder-badge ${page.editorMode === 'builder' ? 'is-builder' : ''}`}>
                  {page.editorMode === 'builder' ? 'Oldalépítő' : 'Szövegszerkesztő'}
                </span>
                <Link className="button" href={`/builder/${page.id}`}>
                  Szerkesztés az építőben
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
