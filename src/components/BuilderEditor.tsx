'use client'

import { createUsePuck, Puck, type Data } from '@measured/puck'
import React, { useCallback, useState } from 'react'

import { puckConfig } from '@/builder/config'

const usePuck = createUsePuck()

/**
 * A teljes képernyős oldalépítő. Két mentési mód van:
 *  - "Vázlat mentése": új vázlat-verziót ment, a publikált oldal NEM változik,
 *    az eredmény a vázlat-előnézetben nézhető meg;
 *  - "Publish" (Puck fejléc-gomb): ment ÉS azonnal publikál.
 * Mindkettő a Payload REST API-n megy, a bejelentkezési sütivel hitelesítve.
 */

type SaveStatus = 'idle' | 'saving' | 'draft-saved' | 'published' | 'error'

function DraftActions({
  onSaveDraft,
  slug,
  status,
}: {
  onSaveDraft: (data: Data) => void
  slug: string
  status: SaveStatus
}) {
  const currentData = usePuck((s) => s.appState.data)
  return (
    <>
      <a
        className="builder-header-link"
        href={`/next/preview?path=${encodeURIComponent(`/${slug}`)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Vázlat-előnézet
      </a>
      <button
        type="button"
        className="builder-header-button"
        disabled={status === 'saving'}
        onClick={() => onSaveDraft(currentData)}
      >
        Vázlat mentése
      </button>
    </>
  )
}

export function BuilderEditor({
  pageId,
  title,
  slug,
  initialData,
}: {
  pageId: number
  title: string
  slug: string
  initialData: unknown
}) {
  const [status, setStatus] = useState<SaveStatus>('idle')

  const emptyData: Data = { content: [], root: { props: {} } }
  const data = (initialData as Data) ?? emptyData

  const save = useCallback(
    async (next: Data, mode: 'draft' | 'publish') => {
      setStatus('saving')
      try {
        const draftParam = mode === 'draft' ? '?draft=true' : ''
        const res = await fetch(`/api/pages/${pageId}${draftParam}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            layout: next,
            editorMode: 'builder',
            _status: mode === 'draft' ? 'draft' : 'published',
          }),
        })
        if (!res.ok) throw new Error(String(res.status))
        setStatus(mode === 'draft' ? 'draft-saved' : 'published')
        setTimeout(() => setStatus('idle'), 2500)
      } catch {
        setStatus('error')
        window.alert(
          'A mentés nem sikerült. Ellenőrizd, hogy be vagy-e jelentkezve az admin felületen, majd próbáld újra.',
        )
      }
    },
    [pageId],
  )

  return (
    <div className="builder-frame">
      <Puck
        config={puckConfig}
        data={data.content ? data : emptyData}
        onPublish={(next) => save(next, 'publish')}
        headerTitle={title}
        headerPath={`/${slug}`}
        overrides={{
          headerActions: ({ children }) => (
            <>
              <DraftActions
                onSaveDraft={(current) => save(current, 'draft')}
                slug={slug}
                status={status}
              />
              {children}
            </>
          ),
        }}
      />
      {status !== 'idle' && (
        <div className="builder-status" role="status">
          {status === 'saving' && 'Mentés…'}
          {status === 'draft-saved' && 'Vázlat elmentve ✓ (a publikált oldal nem változott)'}
          {status === 'published' && 'Elmentve és publikálva ✓'}
          {status === 'error' && 'Hiba történt a mentésnél.'}
        </div>
      )}
    </div>
  )
}
