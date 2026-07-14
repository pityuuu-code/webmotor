'use client'

import { Puck, type Data } from '@measured/puck'
import React, { useState } from 'react'

import { puckConfig } from '@/builder/config'

/**
 * A teljes képernyős oldalépítő. A "Publish" gomb a Payload REST API-n
 * keresztül menti az elrendezést (a bejelentkezési sütivel hitelesítve),
 * és egyben publikálja is az oldalt.
 */
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
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const emptyData: Data = { content: [], root: { props: {} } }
  const data = (initialData as Data) ?? emptyData

  const publish = async (next: Data) => {
    setStatus('saving')
    try {
      const res = await fetch(`/api/pages/${pageId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layout: next,
          editorMode: 'builder',
          _status: 'published',
        }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setStatus('error')
      window.alert(
        'A mentés nem sikerült. Ellenőrizd, hogy be vagy-e jelentkezve az admin felületen, majd próbáld újra.',
      )
    }
  }

  return (
    <div className="builder-frame">
      <Puck
        config={puckConfig}
        data={data.content ? data : emptyData}
        onPublish={publish}
        headerTitle={title}
        headerPath={`/${slug}`}
      />
      {status !== 'idle' && (
        <div className="builder-status" role="status">
          {status === 'saving' && 'Mentés…'}
          {status === 'saved' && 'Elmentve és publikálva ✓'}
          {status === 'error' && 'Hiba történt a mentésnél.'}
        </div>
      )}
    </div>
  )
}
