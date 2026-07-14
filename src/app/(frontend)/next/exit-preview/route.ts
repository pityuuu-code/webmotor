import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

/** Kikapcsolja a vázlat-előnézetet, és visszavisz a főoldalra. */
export async function GET(): Promise<Response> {
  const draft = await draftMode()
  draft.disable()
  redirect('/')
}
