import type { CollectionConfig } from 'payload'

import {
  contentCreateAccess,
  contentMutateAccess,
  forceClientSite,
  isAdminUser,
  userSiteWhere,
} from '../access/roles'
import { siteField } from '../fields/site'
import { siteBaseListFilter } from '../hooks/siteListFilter'

/**
 * Űrlap-építő: kattintva összerakható űrlapok (név, e-mail, legördülő,
 * jelölőnégyzet…). A kész űrlap beszúrható az oldalépítőbe ("Űrlap" szekció)
 * és a cikkekbe is (a "/" beszúró menüből). A kitöltések a Beérkezett
 * üzenetek közé kerülnek, és kérésre e-mail értesítés is megy róluk.
 */
export const Forms: CollectionConfig = {
  slug: 'forms',
  labels: { singular: 'Űrlap', plural: 'Űrlapok' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'updatedAt'],
    description:
      'Összerakható űrlapok. Beszúrás: oldalépítő → "Űrlap" szekció, vagy cikkben a "/" menüből.',
    baseListFilter: siteBaseListFilter,
  },
  access: {
    // Nyilvános olvasás kell (a látogatói űrlap-megjelenítő tölti be);
    // ügyfél-szerkesztő az adminban a saját weboldala űrlapjait kezeli.
    read: ({ req: { user } }) => (!user || isAdminUser(user) ? true : userSiteWhere(user)),
    create: contentCreateAccess,
    update: contentMutateAccess,
    delete: contentMutateAccess,
  },
  hooks: {
    beforeChange: [forceClientSite],
  },
  fields: [
    {
      name: 'name',
      label: 'Űrlap neve',
      type: 'text',
      required: true,
      admin: { description: 'Pl. "Ajánlatkérés" – az adminban és az e-mail értesítésben látszik.' },
    },
    {
      name: 'fields',
      label: 'Mezők',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Mező', plural: 'Mezők' },
      admin: { description: 'A mezők sorrendje a bal oldali fogantyúval húzva rendezhető.' },
      fields: [
        { name: 'label', label: 'Felirat', type: 'text', required: true },
        {
          name: 'fieldType',
          label: 'Típus',
          type: 'select',
          required: true,
          defaultValue: 'text',
          options: [
            { label: 'Szöveg (egysoros)', value: 'text' },
            { label: 'E-mail-cím', value: 'email' },
            { label: 'Hosszú szöveg (több soros)', value: 'textarea' },
            { label: 'Legördülő lista', value: 'select' },
            { label: 'Jelölőnégyzet', value: 'checkbox' },
          ],
        },
        { name: 'required', label: 'Kötelező mező', type: 'checkbox', defaultValue: false },
        {
          name: 'options',
          label: 'Választható értékek (soronként egy)',
          type: 'textarea',
          admin: {
            condition: (_data, siblingData) => siblingData?.fieldType === 'select',
          },
        },
      ],
    },
    {
      name: 'submitLabel',
      label: 'Küldés gomb felirata',
      type: 'text',
      defaultValue: 'Küldés',
    },
    {
      name: 'successMessage',
      label: 'Sikeres küldés üzenete',
      type: 'text',
      defaultValue: 'Köszönjük! Hamarosan válaszolunk.',
    },
    {
      name: 'notifyEmails',
      label: 'Értesítendő e-mail-címek',
      type: 'text',
      admin: {
        description:
          'Beküldéskor ide megy értesítő e-mail; vesszővel elválasztva több cím is megadható. Üresen nincs e-mail (az üzenet az adminban így is megjelenik). Az e-mail-küldéshez a .env-ben be kell állítani a RESEND_API_KEY-t.',
      },
    },
    siteField,
  ],
}
