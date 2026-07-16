import { NextResponse } from 'next/server'

import { submitContactMessage } from '@/lib/forms'

/** A kapcsolatűrlap beküldési végpontja. A logika a lib/forms.ts-ben van. */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Hibás kérés.' }, { status: 400 })
  }

  try {
    const result = await submitContactMessage((body ?? {}) as Parameters<typeof submitContactMessage>[0])
    if (!result.ok) return NextResponse.json(result, { status: 400 })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ ok: false, error: 'Váratlan hiba történt.' }, { status: 500 })
  }
}
