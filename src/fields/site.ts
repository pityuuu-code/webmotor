import type { Field } from 'payload'

/**
 * "Melyik weboldalhoz tartozik?" mező a tartalomtípusokon (multi-tenant).
 * Üresen hagyva a tartalom az ALAPÉRTELMEZETT oldalé (Oldalbeállítások +
 * Menük globálok) – egyoldalas üzemben tehát nincs vele teendő.
 */
export const siteField: Field = {
  name: 'site',
  label: 'Weboldal',
  type: 'relationship',
  relationTo: 'sites',
  index: true,
  admin: {
    position: 'sidebar',
    description:
      'Több weboldalas üzemben: melyik oldalon jelenjen meg. Üresen hagyva az alapértelmezett oldalé.',
  },
}
