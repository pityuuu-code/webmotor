#!/usr/bin/env bash
# Visszaállítás egy korábbi mentésből (adatbázis + képek).
# Használat:  scripts/visszaallitas.sh mentesek/FAJLNEV.tar.gz
set -euo pipefail
cd "$(dirname "$0")/.."

FAJL="${1:-}"
if [ -z "$FAJL" ]; then
  echo "Használat: scripts/visszaallitas.sh mentesek/FAJLNEV.tar.gz"
  echo "Elérhető mentések:"; ls -1 mentesek 2>/dev/null || echo "  (még nincs mentés)"
  exit 1
fi
[ -f "$FAJL" ] || { echo "Nincs ilyen fájl: $FAJL" >&2; exit 1; }

echo "FIGYELEM: ez a MOSTANI tartalmat felülírja a mentésben lévővel."
echo "A mentés utáni cikkek/módosítások elvesznek."
read -r -p "Biztosan folytatod? (igen/nem) " VALASZ
[ "$VALASZ" = "igen" ] || { echo "Megszakítva."; exit 0; }

TMP=$(mktemp -d); tar -xzf "$FAJL" -C "$TMP"
if [ -f .env ]; then set -a; . ./.env; set +a; fi
DB_URL="${DATABASE_URL:-postgres://postgres:postgres@localhost:5432/webmotor}"
RESET_SQL="DROP SCHEMA IF EXISTS public CASCADE; DROP SCHEMA IF EXISTS drizzle CASCADE; CREATE SCHEMA public;"

echo "1/2 Adatbázis visszaállítása (mentett verzió: $(cat "$TMP/verzio.txt" 2>/dev/null || echo '?'))..."
if docker compose ps --status running 2>/dev/null | grep -q postgres; then
  docker compose exec -T postgres psql -U postgres -d webmotor -q -c "$RESET_SQL"
  docker compose exec -T postgres psql -U postgres -d webmotor -q -v ON_ERROR_STOP=1 < "$TMP/adatbazis.sql" >/dev/null
elif command -v psql >/dev/null 2>&1; then
  psql "$DB_URL" -q -c "$RESET_SQL"
  psql "$DB_URL" -q -v ON_ERROR_STOP=1 < "$TMP/adatbazis.sql" >/dev/null
else
  echo "HIBA: nincs elérhető psql." >&2; exit 1
fi

echo "2/2 Képek visszaállítása..."
rm -rf media && cp -R "$TMP/media" media
rm -rf "$TMP"
echo "KÉSZ. Indítsd újra a szervert (Ctrl+C, majd pnpm dev)."
