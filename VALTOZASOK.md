# Változásnapló

Minden verzióhoz tartozik egy letölthető csomag (webmotor-vX.Y.Z.zip) és a frissítés
előtt készített tartalmi mentés (mentesek/ mappa). Visszaállás: régi csomag +
scripts/visszaallitas.sh a hozzá tartozó mentéssel.

## v0.6.0 — 2026-07-16 (keresés az oldalakban is — az S8 sprint lezárása)
- A keresés mostantól az OLDALAKBAN is keres, nem csak a cikkekben: a
  szövegszerkesztős tartalomban és az oldalépítős (Puck) oldalak
  szekció-szövegeiben egyaránt
- Egyesített, pontszám szerint rangsorolt találati lista (cikk- és
  oldal-kártyák vegyesen), oldalanként (multi-tenant) szűrve
- Médiafájl-helyreállítás: a mappaköltözéskor elveszett képek (logó)
  visszatöltve az eredeti forrásokból; a tanulság beépítve az S4/S6 tervekbe
- 2 új integrációs teszt (szövegszerkesztős + oldalépítős oldal keresése);
  élő böngészős ellenőrzés elvégezve

## v0.5.0 — 2026-07-16 (multi-tenant: több weboldal egy motorból)
- Weboldalak kollekció: domainek, saját név/téma/logó/lábléc, mérőkódok,
  közösségi linkek és saját fejléc-/láblécmenük oldalanként
- A kérés domainje dönt: egyező domainnél a weboldal beállításai + tartalmai,
  különben az alapértelmezett oldal (Oldalbeállítások + Menük globálok)
- "Weboldal" mező a cikkeken, oldalakon, kategóriákon és átirányításokon
  (üresen = alapértelmezett oldal); a keresés is oldalra szűr
- A slug oldalanként egyedi (két weboldalon lehet ugyanaz a /kapcsolat),
  ütközésvédelem hookkal az adatbázis-szintű unique helyett
- Domainenkénti sitemap.xml és robots.txt (route handlerek), canonical és
  OG URL-ek az adott domainre; minden kérés frissen renderelődik (nincs ISR)
- Új migráció (weboldalak-multitenant); 4 új integrációs teszt; élő ellenőrzés
  két hosttal (localhost + 127.0.0.1) elvégezve

## v0.4.0 — 2026-07-16 (oldalépítő bővítése)
- 4 új szekció az oldalépítőben: Árlista (kiemelhető csomagok, CTA), Vélemények,
  GYIK (JS nélkül működő lenyílók), Kapcsolatűrlap
- Beérkezett üzenetek kollekció az adminban + /api/kapcsolat végpont
  honeypot spam-védelemmel (a nyilvános REST API-n nem írható)
- Vázlat-mentés a builderben: a "Vázlat mentése" gomb publikálás nélkül ment,
  a "Vázlat-előnézet" linken nézhető meg; a Publish változatlanul élesít
- Új migráció (urlap-bekuldesek); 5 új integrációs teszt az űrlap-feldolgozásra;
  élő böngészős ellenőrzés (szekciók, űrlapbeküldés, vázlat-mentés) elvégezve

## v0.3.0 — 2026-07-16 (keresés az oldalon)
- Postgres full-text keresés magyarra hangolva: ékezet-egyszerűsített
  prefix-egyezés (a toldalékos alakokat is megtalálja) + szótövezett ág,
  súlyozott rangsor (cím > kivonat > törzs); csak publikált cikkek között keres
- Keresőmező a fejlécben (JavaScript nélkül is működő GET-űrlap) és találati
  oldal a /kereses címen, üres- és nincs-találat állapotokkal
- A találati oldal noindex (SEO-alapszabály)
- 6 új integrációs teszt a keresésre (szóalak, ékezet, rangsor, vázlat-szűrés,
  piszkált bemenet); élő böngészős ellenőrzés elvégezve

## v0.2.0 — 2026-07-16 (éles üzemre felkészítés)
- S3-kompatibilis médiatárolás (@payloadcms/storage-s3): a .env-ben megadott
  hozzáféréssel magától bekapcsol (AWS S3, Cloudflare R2, MinIO, Supabase…);
  üres beállításokkal marad a helyi fájlrendszer (fejlesztői mód)
- Éles adatbázis-migrációk: kiindulási migráció (src/migrations/), új szkriptek
  (pnpm migrate / migrate:create / migrate:status), Vercelhez `pnpm ci`
  (migrálás + build egyben); részletes leírás a README új
  "Adatbázis-migrációk" fejezetében
- A média-séma minden környezetben azonos (alwaysInsertFields), így a helyi
  és az éles adatbázis szerkezete nem térhet el
- Éles build és integrációs tesztek zölden

## v0.1.0 — 2026-07-14 (kiindulási alap, teljes körűen leellenőrizve)
- Cikkek és oldalak klasszikus (WP-szerű) szerkesztővel, "/" beszúró menüvel
- Vizuális oldalépítő (Puck) 8 szekcióval, bejelentkezéshez kötött /builder felületen
- Menükezelő (fejléc + lábléc, húzással rendezhető)
- Élő előnézet + Megtekintés gomb; vázlat-előnézet védelemmel
- SEO-csomag: meta/OG/canonical, sitemap.xml, robots.txt, JSON-LD, 301-átirányítások
- GTM + Consent Mode v2 süti-sáv, közösségi linkek, WhatsApp-gomb
- 3 téma, magyar admin; 18 pontos automata átvételi teszt + éles build zölden
- Mentés/visszaállítás szkriptek (scripts/mentes.sh, scripts/visszaallitas.sh)
