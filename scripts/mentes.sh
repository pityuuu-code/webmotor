#!/usr/bin/env bash
# Teljes tartalmi mentés: adatbázis + feltöltött képek, egy fájlba csomagolva.
# Használat:  scripts/mentes.sh
set -euo pipefail
cd "$(dirname "$0")/.."

STAMP=$(date +%Y%m%d-%H%M%S)
VERZIO=$(node -p "require('./package.json').version" 2>/dev/null || echo "ismeretlen")
mkdir -p mentesek
TMP=$(mktemp -d)

if [ -f .env ]; then set -a; . ./.env; set +a; fi
DB_URL="${DATABASE_URL:-postgres://postgres:postgres@localhost:5432/webmotor}"

echo "1/3 Adatbázis mentése..."
if docker compose ps --status running 2>/dev/null | grep -q postgres; then
  docker compose exec -T postgres pg_dump -U postgres -d webmotor > "$TMP/adatbazis.sql"
elif command -v pg_dump >/dev/null 2>&1; then
  pg_dump --dbname="$DB_URL" > "$TMP/adatbazis.sql"
else
  echo "HIBA: nem fut a dockeres postgres, és helyi pg_dump sincs telepítve." >&2
  exit 1
fi

echo "2/3 Feltöltött képek mentése..."
if [ -d media ]; then cp -R media "$TMP/media"; else mkdir "$TMP/media"; fi
echo "$VERZIO" > "$TMP/verzio.txt"
date > "$TMP/idopont.txt"

echo "3/3 Csomagolás..."
FAJL="mentesek/webmotor-mentes-v${VERZIO}-${STAMP}.tar.gz"
tar -czf "$FAJL" -C "$TMP" .
rm -rf "$TMP"
echo "KÉSZ: $FAJL"
