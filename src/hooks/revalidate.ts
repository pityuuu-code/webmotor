import { revalidatePath } from 'next/cache'

/**
 * Publikálás/mentés után azonnal érvényteleníti a frontend cache-ét,
 * így a változás nem 60 mp múlva (ISR), hanem rögtön látszik.
 */
export const revalidateSite = (): void => {
  try {
    revalidatePath('/', 'layout')
  } catch {
    // CLI-ből futtatva (pl. seed script) nincs Next-kontextus – ilyenkor csendben kihagyjuk.
  }
}
