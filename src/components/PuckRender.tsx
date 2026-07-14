'use client'

import { Render } from '@measured/puck'
import React from 'react'

import { puckConfig } from '@/builder/config'

/** Az oldalépítőben összerakott elrendezés megjelenítése a látogatóknak. */
export function PuckRender({ data }: { data: unknown }) {
  if (!data) return null
  return <Render config={puckConfig} data={data as never} />
}
