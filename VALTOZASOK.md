# Változásnapló

Minden verzióhoz tartozik egy letölthető csomag (webmotor-vX.Y.Z.zip) és a frissítés
előtt készített tartalmi mentés (mentesek/ mappa). Visszaállás: régi csomag +
scripts/visszaallitas.sh a hozzá tartozó mentéssel.

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
