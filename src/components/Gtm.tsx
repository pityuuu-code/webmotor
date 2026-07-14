import Script from 'next/script'
import React from 'react'

/**
 * Google Tag Manager + Google Consent Mode v2.
 *
 * Az EU-ban kötelező: a mérőcímkék CSAK a látogató hozzájárulása után
 * kaphatnak teljes adatot. Itt minden "denied" alapállapotba kerül, a
 * ConsentBanner pedig elfogadáskor "granted"-re frissíti.
 *
 * A GA4, Google Ads, Meta Pixel, TikTok Pixel és LinkedIn Insight Tag
 * mind a GTM felületén köthető be – ehhez a kódhoz nem kell hozzányúlni.
 */
export function Gtm({ gtmId }: { gtmId?: string | null }) {
  if (!gtmId) return null

  return (
    <>
      <script
        // Sima inline script: a HTML értelmezésekor azonnal lefut, jóval a GTM betöltése előtt.
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            wait_for_update: 500
          });
        `,
        }}
      />
      <Script id="gtm-loader" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  )
}
