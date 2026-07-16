# Változásnapló

Minden verzióhoz tartozik egy letölthető csomag (webmotor-vX.Y.Z.zip) és a frissítés
előtt készített tartalmi mentés (mentesek/ mappa). Visszaállás: régi csomag +
scripts/visszaallitas.sh a hozzá tartozó mentéssel.

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
