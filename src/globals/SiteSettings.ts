import type { GlobalConfig } from 'payload'

import { revalidateSite } from '../hooks/revalidate'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Oldalbeállítások',
  admin: {
    description: 'Az oldal neve, aktív téma, mérőkódok és közösségi linkek – egy helyen.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [() => revalidateSite()],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Általános',
          fields: [
            {
              name: 'siteName',
              label: 'Oldal neve',
              type: 'text',
              required: true,
              defaultValue: 'Webmotor',
            },
            {
              name: 'tagline',
              label: 'Szlogen / alcím',
              type: 'text',
              admin: { description: 'A főoldal fejlécében és az alap meta leírásban jelenik meg.' },
            },
            {
              name: 'logo',
              label: 'Logó',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Ha üres, az oldal neve jelenik meg szövegként.' },
            },
            {
              name: 'theme',
              label: 'Aktív design téma',
              type: 'select',
              required: true,
              defaultValue: 'folyoirat',
              options: [
                { label: 'Folyóirat – irodalmi, nyugodt, olvasásra hangolt', value: 'folyoirat' },
                { label: 'Stúdió – modern, éles, technológiai', value: 'studio' },
                { label: 'Magazin – harsány, nagybetűs, hírportál-jellegű', value: 'magazin' },
              ],
              admin: {
                description:
                  'Váltáskor az egész oldal kinézete átáll – a tartalomhoz nem kell hozzányúlni.',
              },
            },
            {
              name: 'footerText',
              label: 'Lábléc szöveg',
              type: 'textarea',
            },
          ],
        },
        {
          label: 'Mérés és integrációk',
          fields: [
            {
              name: 'gtmId',
              label: 'Google Tag Manager konténer ID',
              type: 'text',
              admin: {
                description:
                  'Formátum: GTM-XXXXXXX. Ezen az egy konténeren keresztül köthető be a GA4, a Google Ads, a Meta Pixel, a TikTok Pixel és a LinkedIn Insight Tag – kódmódosítás nélkül.',
              },
            },
            {
              name: 'searchConsoleVerification',
              label: 'Google Search Console hitelesítő kód',
              type: 'text',
              admin: {
                description:
                  'A Search Console "HTML-címke" hitelesítési módjánál kapott content érték (csak a kód, nem a teljes meta tag).',
              },
            },
          ],
        },
        {
          label: 'Közösségi média',
          fields: [
            {
              name: 'socials',
              label: 'Profilok',
              type: 'group',
              fields: [
                { name: 'facebook', label: 'Facebook URL', type: 'text' },
                { name: 'instagram', label: 'Instagram URL', type: 'text' },
                { name: 'tiktok', label: 'TikTok URL', type: 'text' },
                { name: 'linkedin', label: 'LinkedIn URL', type: 'text' },
                { name: 'youtube', label: 'YouTube URL', type: 'text' },
                {
                  name: 'whatsapp',
                  label: 'WhatsApp szám',
                  type: 'text',
                  admin: {
                    description:
                      'Nemzetközi formátumban, + és szóközök nélkül, pl. 36301234567. Kitöltve lebegő WhatsApp-gomb jelenik meg az oldalon.',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
