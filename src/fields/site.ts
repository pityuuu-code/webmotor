import type { Field } from 'payload'

import { siteDefaultValue } from '../hooks/siteListFilter'

/**
 * "Melyik weboldalhoz tartozik?" mező a tartalomtípusokon (multi-tenant).
 * Üresen hagyva a tartalom az ALAPÉRTELMEZETT oldalé (Oldalbeállítások +
 * Menük globálok) – egyoldalas üzemben tehát nincs vele teendő.
 * Ha az admin oldalváltójában ki van választva egy weboldal, új tartalomnál
 * automatikusan az lesz beállítva.
 */
export const siteField: Field = {
  name: 'site',
  label: 'Weboldal',
  type: 'relationship',
  relationTo: 'sites',
  index: true,
  defaultValue: siteDefaultValue,
  admin: {
    position: 'sidebar',
    description:
      'Több weboldalas üzemben: melyik oldalon jelenjen meg. Üresen hagyva az alapértelmezett oldalé.',
  },
}
