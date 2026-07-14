import config from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

/**
 * Az élő előnézet belépési pontja: /next/preview?path=/cikk/valami
 * Csak bejelentkezett admin-felhasználónak engedélyezi a vázlatok megtekintését,
 * bekapcsolja a Next "draft mode"-ot, majd továbbít a kért oldalra.
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path') || '/'

  // Csak saját, perjellel kezdődő útvonalra irányítunk (open redirect védelem).
  if (!path.startsWith('/') || path.startsWith('//')) {
    return new Response('Érvénytelen útvonal.', { status: 400 })
  }

  const payload = await getPayload({ config })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  if (!user) {
    return new Response('Az előnézethez jelentkezz be az admin felületen.', { status: 403 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(path)
}
