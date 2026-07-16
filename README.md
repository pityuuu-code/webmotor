# Webmotor

Saját fejlesztésű, SEO-központú tartalomkezelő motor. **Next.js 16 + Payload CMS 3 + PostgreSQL**, egyetlen TypeScript kódbázisban: az admin felület és a látogatói oldal ugyanabban az alkalmazásban fut.

## Mit tud már most?

- **Klasszikus, WordPress-szerű szövegszerkesztő** – állandó eszköztár (címsorok, félkövér, listák, link, kép), "/" beszúró menü, és a szövegbe szúrható elemek: galéria, CTA, YouTube-videó. Vázlat/publikálás munkafolyamat, automatikus mentés, verziózás.
- **Három beépített design téma** (*Folyóirat*, *Stúdió*, *Magazin*) – az adminban egy legördülővel váltható, a tartalomhoz nem kell hozzányúlni.
- **SEO alapfelszereltség**: cikkenkénti meta cím/leírás/OG-kép/canonical/noindex, automatikus `sitemap.xml` és `robots.txt`, Schema.org Article JSON-LD, 301-es átirányítás-kezelő, automatikus képméretezés, Search Console hitelesítő mező.
- **Integrációs központ**: Google Tag Manager egy kattintással, EU-kompatibilis süti-sáv (Google Consent Mode v2), közösségi linkek, lebegő WhatsApp-gomb.
- **Élő előnézet**: a cikk/oldal szerkesztése közben oldalt látod a valódi megjelenést az aktív témával, mobil/tablet/asztali nézetben – gépelés közben, kb. másodperces késéssel frissül.
- **Vizuális oldalépítő (Puck)**: az oldalak húzd-és-ejtsd módon, kész szekciókból is összerakhatók (hero, szöveg, kép, kártyák, CTA, videó, térköz) a bejelentkezéshez kötött **/builder** felületen. A szekciók a témák stílusát öröklik, így témaváltáskor ezek az oldalak is átöltöznek.
- **Menükezelő** (Admin → *Menük*): fejléc- és láblécmenü, menüpontok húzással rendezhető sorrendben, belső oldalra vagy egyéni URL-re mutató linkekkel – mint a WP Megjelenés → Menük.
- **Magyar admin felület** (angol fallbackkel).
- **Élesre kész alapok**: S3-kompatibilis médiatárolás (AWS S3, Cloudflare R2, MinIO, Supabase…) – a `.env`-ben megadott hozzáféréssel magától bekapcsol; adatbázis-migrációk éles telepítéshez (`pnpm migrate`).

---

## Első indítás (fejlesztőknek)

Követelmények: **Node.js 20+**, **pnpm 9+** (`corepack enable`), **Docker Desktop** (csak az adatbázishoz).

```bash
# 1. Környezeti változók (a repóban lévő .env fejlesztéshez már jó)
cp .env.example .env   # ha nincs .env

# 2. Adatbázis indítása
docker compose up -d

# 3. Függőségek + típusgenerálás
pnpm install
pnpm generate:types

# 4. Fejlesztői szerver
pnpm dev
```

Ezután:

- **http://localhost:3000/admin** → első látogatáskor itt hozod létre az első admin felhasználót,
- **http://localhost:3000** → a látogatói oldal.

A táblákat a Payload fejlesztői módban automatikusan létrehozza és szinkronban tartja; élesben migrációk futnak (lásd az *Adatbázis-migrációk* fejezetet).

> **Fontos – admin komponens-jegyzék (importMap):** ha a `payload.config.ts`-ben új szerkesztő-funkciót vagy admin-komponenst kapcsolsz be, a `src/app/(payload)/admin/importMap.js`-t újra kell generálni, különben az adott mező nem jelenik meg az adminban. A `pnpm dev` és a `pnpm build` ezt már automatikusan megteszi; kézzel: `pnpm generate:importmap`.

> **Ismert buktató – `ERR_PNPM_IGNORED_BUILDS`:** a pnpm 10 óta biztonsági okból alapból nem futnak a csomagok telepítő szkriptjei, a pnpm 11 pedig hibával el is utasítja őket engedély nélkül. A repóban lévő `pnpm-workspace.yaml` mindkét formátumban engedélyezi a három szükségeset (pnpm 11+: `allowBuilds`, pnpm 10: `onlyBuiltDependencies`). Ha mégis ezt a hibát látod, ellenőrizd, hogy a `pnpm-workspace.yaml` ott van-e a projekt gyökerében (Dockerben: be van-e másolva!), majd `rm -rf node_modules && pnpm install`.

> **Típusokról:** a `src/lib/cms.ts`-ben néhány `as never` cast van, mert a `src/payload-types.ts` a `pnpm generate:types` futtatásáig a sablon állapotát tükrözi. Generálás után a castok fokozatosan törölhetők, és minden lekérdezés szigorúan típusos lesz.

---

## Napi használat (szerkesztőknek)

**Cikk feltöltése:** Admin → *Cikkek* → *Új létrehozása*. Add meg a címet, a kivonatot és a borítóképet, majd írd a cikket a *Tartalom* mezőben, mint egy Wordben: felül az eszköztár (címsorok H2-től, félkövér, listák, link, képbeszúrás), a "/" jel pedig előhozza a beszúró menüt (galéria, videó, CTA, idézet). A jobb oldali sávban választhatsz kategóriát; az URL a címből automatikusan készül. A *SEO* mezőcsoportban állítsd be a meta címet és leírást (a mezők alatt ott a hossz-ajánlás). Végül jobb felül **Közzététel** – a változás azonnal kint van.

**Élő előnézet:** a cikk szerkesztőjében kattints a jobb felső sarok melletti *Élő előnézet* (szem ikonos) fülre – a képernyő kettéválik, jobb oldalt a cikk látszik a valódi kinézetében, és gépelés közben frissül. Felül átválthatsz mobil/tablet/asztali nézetre.

**Oldal összerakása az oldalépítőben:** 1. Admin → *Oldalak* → *Új létrehozása*: adj címet, a jobb oldali sávban a *Szerkesztési mód* legyen „Vizuális oldalépítő", majd **Közzététel**. 2. Nyisd meg a **/builder** címet (pl. http://localhost:3000/builder), és kattints az oldalnál a *Szerkesztés az építőben* gombra. 3. Bal oldalt a szekciók listája – húzd be őket középre, kattints rájuk a szövegek/képek átírásához, végül jobb felül **Publish**. Az oldalépítő csak bejelentkezve érhető el.

**Menü szerkesztése:** Admin → *Menük*. Menüpont hozzáadása a gombbal (felirat + belső oldal vagy egyéni link), a sorrend a bal oldali fogantyúval húzva rendezhető, a fejléc és a lábléc külön fülön van. Mentés után azonnal frissül az oldalon.

**Témaváltás:** Admin → *Oldalbeállítások* → *Aktív design téma*. Mentés után az egész oldal átöltözik.

**URL-változás (fontos SEO-szabály):** ha egy publikált cikk slugját átírod, vedd fel a régit az Admin → *Átirányítások* alá (`/cikk/regi-slug` → `/cikk/uj-slug`), különben a Google-ban gyűjtött helyezés elveszik.

---

## Verziókezelés (git)

A projekt kész git-repó: minden verzió commitolva és címkézve (`v0.1.0`, `v0.2.0`, …).

**Egyszeri teendő — a repó feltöltése GitHubra (kb. 2 perc):**
1. github.com → *New repository* → név: `webmotor`, láthatóság: **Private** → és **üresen** hozd létre (semmilyen "Add README / .gitignore" pipát ne jelölj be).
2. Majd a projekt mappájában:

```bash
git remote add origin https://github.com/FELHASZNALONEV/webmotor.git
git push -u origin main --follow-tags
```

3. A commitok szerzőjét írjátok át sajátra: `git config user.name "Neved"` és `git config user.email "email@cim.hu"`.

**Sprint-munkafolyamat:** minden átadott verzió új committal és verziócímkével érkezik — átvétel után csak `git push --follow-tags`. **Visszaállás egy régi kódverzióra:** `git checkout vX.Y.Z` (és mellé a hozzá tartozó tartalmi mentés visszatöltése: lásd a Mentés fejezetet).

---

## Mentés és visszaállítás

A tartalom (adatbázis + feltöltött képek) egy paranccsal menthető és visszaállítható:

```bash
# Mentés készítése (a mentesek/ mappába kerül, verziószámmal és időbélyeggel):
scripts/mentes.sh

# Visszaállítás egy korábbi mentésből:
scripts/visszaallitas.sh mentesek/webmotor-mentes-v0.1.0-20260714-155447.tar.gz
```

**Frissítési rítus — minden verzióváltásnál, kivétel nélkül:**
1. `scripts/mentes.sh` — mentés a mostani állapotról,
2. jöhet az új verzió (mappa-csere vagy git pull),
3. ha bármi baj van: vissza a **régi kód** + `scripts/visszaallitas.sh` a **hozzá tartozó mentéssel** (a fájlnévben ott a verziószám, a szkript visszaálláskor ki is írja).

A kód és a tartalom párban jár: régi kódhoz a hozzá készült mentést töltsd vissza. Figyelem: a visszaállítás a mentés *utáni* módosításokat felülírja — ez minden visszaállás természete, ezért mentés gyakran és mindig frissítés előtt.

---

## Integrációk bekötése

Minden mérés egyetlen helyre fut be: **Admin → Oldalbeállítások → Mérés és integrációk**.

1. **Google Tag Manager**: hozz létre egy konténert a [tagmanager.google.com](https://tagmanager.google.com) oldalon, és a `GTM-XXXXXXX` azonosítót írd be az adminba. Ennyi – a kód többé nem kell.
2. **GA4, Google Ads, Meta (Facebook/Instagram) Pixel, TikTok Pixel, LinkedIn Insight Tag**: mindet a GTM felületén veszed fel címkeként (tag), kódmódosítás nélkül. A süti-sáv *Elfogadom* gombja `consent_granted` eseményt küld a dataLayerbe – a címkéket erre az eseményre (vagy beépített consent-ellenőrzésre) állítsd.
3. **Süti-hozzájárulás (EU)**: a motor Google Consent Mode v2-vel indul, minden tárolás alapból *denied*, és csak a látogató elfogadása után vált *granted*-re. Ez feltétele a pontos Ads/GA4-mérésnek az EU-ban.
4. **Google Search Console**: adj hozzá új tulajdont *URL-előtag* módban, válaszd a *HTML-címke* hitelesítést, és a kapott `content` értéket írd be az adminba a *Search Console hitelesítő kód* mezőbe. Utána a Search Console-ban küldd be a sitemapet: `https://sajatdomain.hu/sitemap.xml`.
5. **WhatsApp**: az *Oldalbeállítások → Közösségi média* alatt add meg a számot nemzetközi formátumban (`36301234567`) – megjelenik a lebegő zöld gomb.
6. **Facebook/Instagram/TikTok/LinkedIn/YouTube linkek**: ugyanott; a láblécben jelennek meg.

---

## Hogyan bővítsd?

A motor három ponton van felkészítve a növekedésre:

**Új beszúrható elem a szerkesztőbe** (pl. „Letölthető fájl” vagy „GYIK”):
1. `src/blocks/index.ts` – definiáld a mezőit, tedd be az `embedBlocks` tömbbe,
2. `src/lib/types.ts` – vedd fel az elem típusát,
3. `src/components/RichContent.tsx` – írj hozzá egy megjelenítőt a `blocks` átalakítók közé.
Ettől kezdve minden szerkesztő beszúrhatja a "/" menüből, minden témában.

**Új szekció az oldalépítőbe** (pl. „Árlista" vagy „Vélemények"): a `src/builder/config.tsx`-ben adj hozzá egy új bejegyzést a `components` objektumhoz (mezők + megjelenítés), a hozzá tartozó stílus pedig a `styles.css` „Oldalépítő szekciók" részébe kerül. Mentés után azonnal ott lesz a builder bal oldali listájában.

**Új design téma:**
1. `src/app/(frontend)/styles.css` – új `[data-theme='sajattema']` blokk a CSS-változókkal (+ opcionális szignatúra-szabályok),
2. `src/globals/SiteSettings.ts` – új opció a témalistában,
3. `src/lib/types.ts` – bővítsd a `ThemeName` uniont.

**Új tartalomtípus** (pl. Termékek, Események): új fájl a `src/collections/` alá a meglévők mintájára, majd regisztráció a `src/payload.config.ts`-ben. Az admin felület magától megjelenik hozzá.

Az architektúra szabálya: a frontend **kizárólag** a `src/lib/cms.ts`-en keresztül kérdez le adatot – új lekérdezés is oda kerüljön.

```
src/
├── payload.config.ts        # a motor "gerince": mi van regisztrálva
├── collections/             # tartalomtípusok (Cikkek, Oldalak, Kategóriák, Média, Átirányítások, Felhasználók)
├── globals/                 # Oldalbeállítások (téma, GTM, közösségi linkek) és Menük
├── blocks/                  # a szerkesztőbe beszúrható elemek definíciói
├── builder/                 # a vizuális oldalépítő (Puck) szekciókészlete
├── fields/                  # újrafelhasználható mezők (slug, SEO)
├── hooks/                   # publikáláskori cache-frissítés
├── lib/                     # adatelérési réteg + domain-típusok
├── components/              # blokk-renderelő, fejléc/lábléc, GTM, süti-sáv, JSON-LD
└── app/
    ├── robots.ts, sitemap.ts# SEO metaútvonalak (kötelezően az app gyökerében)
    ├── (frontend)/          # látogatói oldal: főoldal, /cikk/[slug], /[slug], /kategoria/[slug]
    ├── (builder)/           # a /builder oldalépítő felület (csak bejelentkezve)
    └── (payload)/           # a Payload admin (generált – ne módosítsd kézzel)
```

---

## Adatbázis-migrációk (élesben)

Két üzemmód van, és **soha nem szabad keverni őket ugyanazon az adatbázison**:

- **Fejlesztésben (pnpm dev):** a Payload *push* módban magától létrehozza és szinkronban tartja a táblákat – nincs teendő.
- **Élesben:** a sémát verziózott migrációk kezelik (`src/migrations/`). Az éles adatbázist az első telepítéskor is a migrációk hozzák létre.

**Munkafolyamat, amikor a séma változik** (új kollekció, új mező stb.):

```bash
# 1. Fejleszd le a változást (pnpm dev közben a helyi DB magától követi)
# 2. Készíts migrációt, beszédes névvel:
pnpm migrate:create ertelmes-nev
# 3. Commitold a src/migrations/ alá került fájlokat a kódváltozással együtt
```

**Éles telepítéskor** a migrációkat az indulás/build előtt kell lefuttatni:

- **Vercel:** a projekt *Build Command*-ja legyen `pnpm ci` (ez előbb migrál, aztán buildel).
- **VPS/Docker:** telepítéskor futtasd le: `pnpm migrate` (állapot-ellenőrzés: `pnpm migrate:status`), utána indítsd az appot.

> **Figyelem:** a fejlesztői `pnpm dev`-et soha ne irányítsd az éles adatbázisra – a push mód megkerüli a migrációkat, és a kettő összeakad.

---

## Éles üzembe helyezés (röviden)

- **Legegyszerűbb út:** Vercel + kezelt Postgres (pl. Neon, Supabase). Állítsd be a `DATABASE_URL`, `PAYLOAD_SECRET` (új, hosszú kulcs!) és `NEXT_PUBLIC_SERVER_URL` (a végleges domain) változókat, a *Build Command* pedig `pnpm ci` legyen (migrációk + build).
- **VPS-út:** a repóban lévő `Dockerfile` + Postgres ugyanazon a gépen; telepítéskor `pnpm migrate`.
- **Feltöltött képek – S3 (éleshez kötelező):** töltsd ki a `.env`-ben az `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` (és AWS-nél az `S3_REGION`, R2/MinIO-nál az `S3_ENDPOINT`) változókat – ettől a feltöltések S3-ba kerülnek, a képek kiszolgálása változatlanul a `/api/media/...` útvonalon történik, más beállítás nem kell. Üres S3-adatokkal (pl. fejlesztésben) a képek a helyi fájlrendszerre mennek. Vercel-deploynál az S3 kitöltése nélkül a feltöltött képek **elvesznek** minden újratelepítésnél.

## Fejlesztési térkép (javasolt sorrendben)

1. ~~S3 médiatárolás (éleshez kötelező) és éles adatbázis-migrációk.~~ ✅ Kész (v0.2.0).
2. Keresés az oldalon (Postgres full-text).
3. Hírlevél-blokk + feliratkozás-kezelés.
4. Automatikus közösségi posztolás publikáláskor (Meta Graph API, LinkedIn API) `afterChange` hookból.
5. Az oldalépítő szekciókészletének bővítése (árlista, vélemények, GYIK, kapcsolatűrlap) és vázlat-mentés a builderben.
6. Több oldal kiszolgálása egy motorból (multi-tenant): `Sites` kollekció + domain-alapú témaválasztás.
