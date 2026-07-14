# Változásnapló

Minden verzióhoz tartozik egy letölthető csomag (webmotor-vX.Y.Z.zip) és a frissítés
előtt készített tartalmi mentés (mentesek/ mappa). Visszaállás: régi csomag +
scripts/visszaallitas.sh a hozzá tartozó mentéssel.

## v0.1.0 — 2026-07-14 (kiindulási alap, teljes körűen leellenőrizve)
- Cikkek és oldalak klasszikus (WP-szerű) szerkesztővel, "/" beszúró menüvel
- Vizuális oldalépítő (Puck) 8 szekcióval, bejelentkezéshez kötött /builder felületen
- Menükezelő (fejléc + lábléc, húzással rendezhető)
- Élő előnézet + Megtekintés gomb; vázlat-előnézet védelemmel
- SEO-csomag: meta/OG/canonical, sitemap.xml, robots.txt, JSON-LD, 301-átirányítások
- GTM + Consent Mode v2 süti-sáv, közösségi linkek, WhatsApp-gomb
- 3 téma, magyar admin; 18 pontos automata átvételi teszt + éles build zölden
- Mentés/visszaállítás szkriptek (scripts/mentes.sh, scripts/visszaallitas.sh)
