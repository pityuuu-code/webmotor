# Webmotor

Saját fejlesztésű, SEO-központú tartalomkezelő motor. **Next.js 16 + Payload CMS 3 + PostgreSQL**, egyetlen TypeScript kódbázisban: az admin felület és a látogatói oldal ugyanabban az alkalmazásban fut.

## Mit tud már most?

- **Klasszikus, WordPress-szerű szövegszerkesztő** – állandó eszköztár (címsorok, félkövér, listák, link, kép), "/" beszúró menü, és a szövegbe szúrható elemek: galéria, CTA, YouTube-videó. Vázlat/publikálás munkafolyamat, automatikus mentés, verziózás.
- **Három beépített design téma** (*Folyóirat*, *Stúdió*, *Magazin*) – az adminban egy legördülővel váltható, a tartalomhoz nem kell hozzányúlni.
- **SEO alapfelszereltség**: cikkenkénti meta cím/leírás/OG-kép/canonical/noindex, automatikus `sitemap.xml` és `robots.txt`, Schema.org Article JSON-LD, 301-es átirányítás-kezelő, automatikus képméretezés, Search Console hitelesítő mező.
- **Okos átirányítások + 404-napló**: ha egy publikált cikk/oldal URL-jét átírod, a régi címről **magától** készül 301-es átirányítás (láncok kisimítva – A→B→C helyett A→C). Az Admin → *404-napló* mutatja, milyen nem létező címekre érkeznek látogatók, számlálóval – a gyakoriakra érdemes átirányítást felvenni.
- **Integrációs központ**: Google Tag Manager egy kattintással, EU-kompatibilis süti-sáv (Google Consent Mode v2), közösségi linkek, lebegő WhatsApp-gomb.
- **Élő előnézet**: a cikk/oldal szerkesztése közben oldalt látod a valódi megjelenést az aktív témával, mobil/tablet/asztali nézetben – gépelés közben, kb. másodperces késéssel frissül.
- **Vizuális oldalépítő (Puck)**: az oldalak húzd-és-ejtsd módon, kész szekciókból is összerakhatók (hero, szöveg, kép, **képes galéria**, kártyák, CTA, videó, **térkép**, árlista, vélemények, GYIK, kapcsolatűrlap, saját űrlap, térköz) a bejelentkezéshez kötött **/builder** felületen. A szekciók a témák stílusát öröklik, így témaváltáskor ezek az oldalak is átöltöznek. A *Vázlat mentése* gombbal publikálás nélkül is menthetsz – az eredmény a *Vázlat-előnézet* linkkel nézhető meg, élesíteni a *Publish* gomb fog; a fejléc nyilaival visszavonhatod/újra elvégezheted a lépéseket. A térképhez nem kell Google API-kulcs – csak írd be a címet.
- **Kapcsolatűrlap + Beérkezett üzenetek**: az oldalépítő „Kapcsolatűrlap" szekciója beépített spam-védelemmel (honeypot) menti az üzeneteket az Admin → *Beérkezett üzenetek* alá – e-mail-fiók bekötése nélkül is működik.
- **Űrlap-építő (Admin → Űrlapok)**: kattintva összerakható űrlapok (szöveg, e-mail, hosszú szöveg, legördülő, jelölőnégyzet; kötelezőség mezőnként) – beszúrható az oldalépítőbe („Űrlap" szekció) és a cikkekbe is (a „/" menüből). A kitöltések a *Beérkezett üzenetek* közé kerülnek, és kérésre **e-mail értesítés** is megy róluk (Resend – a `.env`-ben megadott kulccsal magától bekapcsol, nélküle a levél a szerver konzoljára íródik).
- **Menükezelő** (Admin → *Menük*): fejléc- és láblécmenü, menüpontok húzással rendezhető sorrendben, belső oldalra vagy egyéni URL-re mutató linkekkel – mint a WP Megjelenés → Menük.
- **Magyar admin felület** (angol fallbackkel).
- **Élesre kész alapok**: S3-kompatibilis médiatárolás (AWS S3, Cloudflare R2, MinIO, Supabase…) – a `.env`-ben megadott hozzáféréssel magától bekapcsol; adatbázis-migrációk éles telepítéshez (`pnpm migrate`).
- **Keresés az oldalon** (Postgres full-text, magyarra hangolva): keresőmező a fejlécben + találati oldal a `/kereses` címen. A cikkekben ÉS az oldalakban is keres – az oldalépítővel készült oldalak szekció-szövegeiben is. Ékezetek nélkül is talál, a toldalékos alakokat is megtalálja (kutya → kutyák, kutyát), a címbeli találat előrébb rangsorol, mint a törzsbeli. A találati oldal noindex – a keresők nem indexelik. Beállítást nem igényel; külön adatbázis-index sem kell, több ezer cikkig gyors.
- **Több weboldal egy motorból (multi-tenant)**: az Admin → *Weboldalak* alatt felvett oldalak saját domainen, saját névvel, témával, menükkel, mérőkódokkal és saját tartalommal futnak – egyetlen telepítésből. A sitemap, a robots.txt és a canonical URL-ek domainenként készülnek. Részletek lejjebb.

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

**Cikk időzítése:** állítsd a jobb oldali sáv *Publikálás dátuma* mezőjét jövőbeli időpontra, majd kattints a **Közzététel**re – a cikk magától akkor jelenik meg az oldalon (addig a listákban, keresésben, sitemapben sem látszik). Nem kell hozzá semmilyen ütemező.

**Cikk duplikálása:** a cikk szerkesztőjében a jobb felső ⋮ menü → *Duplicate* – a másolat vázlatként jön létre, az URL-je automatikusan számozott változatot kap (pl. `cikk-cim-2`).

**Oldal összerakása az oldalépítőben:** 1. Admin → *Oldalak* → *Új létrehozása*: adj címet, a jobb oldali sávban a *Szerkesztési mód* legyen „Vizuális oldalépítő", majd **Közzététel**. 2. Nyisd meg a **/builder** címet (pl. http://localhost:3000/builder), és kattints az oldalnál a *Szerkesztés az építőben* gombra. 3. Bal oldalt a szekciók listája – húzd be őket középre, kattints rájuk a szövegek/képek átírásához. Menteni kétféleképp lehet: a **Vázlat mentése** gomb publikálás nélkül ment (a látogatók a régi változatot látják, te a *Vázlat-előnézet* linken nézheted az újat), a **Publish** gomb pedig ment és azonnal élesít. Az oldalépítő csak bejelentkezve érhető el.

**Beérkezett üzenetek:** ha az oldaladon van „Kapcsolatűrlap" szekció, a beküldött üzenetek az Admin → *Beérkezett üzenetek* alatt gyűlnek (név, e-mail, üzenet, melyik oldalról jött). A kitöltött honeypot-mezős (bot-) beküldéseket a motor csendben eldobja.

**Saját űrlap összerakása:** Admin → *Űrlapok* → *Új létrehozása*. Adj nevet (pl. „Ajánlatkérés"), vedd fel a mezőket (típus + kötelezőség; legördülőnél soronként egy választható érték), állítsd be a gomb feliratát és a sikeres küldés üzenetét. Az *Értesítendő e-mail-címek* mezőbe írt cím(ek)re beküldéskor e-mail megy – ehhez a `.env`-ben kell egy `RESEND_API_KEY` (resend.com, ingyenes sáv van; nélküle az értesítés a szerver naplójába íródik, az üzenet az adminban így is megvan). Beszúrás az oldalra: oldalépítő → **Űrlap** szekció; cikkbe: a szerkesztő „/" menüjéből **Űrlap**.

**Menü szerkesztése:** Admin → *Menük*. Menüpont hozzáadása a gombbal (felirat + belső oldal vagy egyéni link), a sorrend a bal oldali fogantyúval húzva rendezhető, a fejléc és a lábléc külön fülön van. Mentés után azonnal frissül az oldalon.

**Témaváltás:** Admin → *Oldalbeállítások* → *Aktív design téma*. Mentés után az egész oldal átöltözik.

**URL-változás:** ha egy publikált cikk vagy oldal slugját átírod, a motor **magától felveszi** a 301-es átirányítást a régi címről (látható és szerkeszthető az Admin → *Átirányítások* alatt) – a Google-helyezés nem veszik el. Kézzel csak akkor kell átirányítást felvenned, ha külső/örökölt címekről irányítanál át (ehhez adnak ötletet a *404-napló* leggyakoribb sorai).

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

## Több weboldal egy motorból (multi-tenant)

Alaphelyzetben a motor EGY oldalt szolgál ki: ez az **alapértelmezett oldal**, amit az *Oldalbeállítások* és a *Menük* kezel – ehhez semmi újat nem kell tudni.

**Új weboldal indítása ugyanabból a motorból:**
1. Admin → *Weboldalak* → *Új létrehozása*: adj belső nevet, vedd fel a domain(eke)t (pl. `ugyfel.hu` – ha www-vel is fut, azt külön sorként), állítsd be a nevét, témáját, menüit, mérőkódjait a füleken.
2. Irányítsd a domaint a szerverre (DNS), és vedd fel a hosting oldalán is (Vercelnél: Domains; VPS-nél a reverse proxyban).
3. A tartalmaknál (cikk, oldal, kategória, átirányítás) a jobb oldali sáv **Weboldal** mezőjében válaszd ki, melyik oldalé – üresen hagyva az alapértelmezett oldalé.

**Oldalváltó az adminban:** a bal oldali sáv tetején lévő „Melyik weboldalon dolgozol?" lenyílóval választhatsz. A listák (cikkek, oldalak, kategóriák, médiatár, átirányítások, beérkezett üzenetek) ilyenkor csak a kiválasztott oldal tartalmát mutatják, és minden ÚJ tartalom automatikusan ehhez az oldalhoz jön létre. A „Minden weboldal" nézet mindent mutat.

**Amit érdemes tudni:**
- A kérés domainje dönt: ha egyezik egy *Weboldalak*-bejegyzés domainjével, annak a beállításai és tartalmai élnek; különben az alapértelmezett oldal.
- Két KÜLÖNBÖZŐ weboldalon lehet ugyanaz az URL (mindkettőn lehet pl. `/kapcsolat`) – egy oldalon belül a motor nem engedi az ütközést.
- A keresés, a sitemap.xml, a robots.txt és a canonical URL-ek mind az adott domainre szűrve/számolva készülnek.
- A kapcsolatűrlap beküldései a beküldő domain alapján automatikusan a megfelelő weboldalhoz kötődnek.
- A médiatárban a képek weboldalhoz rendelhetők (az oldalváltó itt is szűr).
- **Szerepkörök:** a Felhasználóknál két szerep van. Az **Ügynökség-admin** mindent lát és szerkeszt. Az **Ügyfél-szerkesztő** (hozzárendelt weboldallal) CSAK a saját oldala tartalmát éri el – cikkek, oldalak, kategóriák, médiatár, űrlapok, átirányítások, 404-napló, üzenetek –, minden új tartalma automatikusan a saját oldalára kerül, a Weboldalak/Oldalbeállítások/Menük pedig nem is látszanak neki. A szerepét és a hozzárendelt oldalát csak admin módosíthatja.
- Multi-tenant üzemben minden kérés frissen renderelődik (nincs oldal-cache) – kis és közepes forgalomnál ez észrevehetetlen; nagy forgalom alá tegyél CDN-t.

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
2. ~~Keresés az oldalon (Postgres full-text).~~ ✅ Kész (v0.3.0).
3. ~~Hírlevél-blokk + feliratkozás-kezelés.~~ *Kihagyva (döntés alapján).*
4. ~~Az oldalépítő szekciókészletének bővítése (árlista, vélemények, GYIK, kapcsolatűrlap) és vázlat-mentés a builderben.~~ ✅ Kész (v0.4.0).
5. ~~Több oldal kiszolgálása egy motorból (multi-tenant): `Sites` kollekció + domain-alapú témaválasztás.~~ ✅ Kész (v0.5.0).
6. Automatikus közösségi posztolás publikáláskor (Meta Graph API, LinkedIn API) `afterChange` hookból. *Utolsó lépcsőre halasztva – Meta/LinkedIn fejlesztői hozzáférés kell hozzá.*

Állás: 1., 2., 4., 5. kész; a 3. (hírlevél) kihagyva. Egyedül a 6. (közösségi posztolás) van hátra, szándékosan a végére halasztva. Nincs más tétel a térképen – új irányt (pl. szerkesztői jogosultságok oldalankénti szétválasztása) külön kell kijelölni.
