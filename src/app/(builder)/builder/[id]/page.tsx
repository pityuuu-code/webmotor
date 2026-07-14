import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import { BuilderEditor } from '@/components/BuilderEditor'
import type { PageDoc } from '@/lib/types'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

/** /builder/[id] – a kiválasztott oldal teljes képernyős szerkesztése. */
export default async function BuilderEditPage({ params }: Props) {
  const { id } = await params

  const payload = await getPayload({ config })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })
  if (!user) redirect('/admin')

  let doc: (PageDoc & { id: number }) | null = null
  try {
    doc = (await payload.findByID({
      collection: 'pages' as never,
      id,
      draft: true,
      depth: 0,
    })) as unknown as PageDoc & { id: number }
  } catch {
    doc = null
  }
  if (!doc) notFound()

  return (
    <BuilderEditor pageId={doc.id} title={doc.title} slug={doc.slug} initialData={doc.layout ?? null} />
  )
}
