#!/usr/bin/env bash
# Automatikus mentés megőrzési szabállyal – ütemezett (napi) futtatásra.
#
# Amit csinál:
#   1. lefuttatja a scripts/mentes.sh-t (adatbázis + képek egy tar.gz-be),
#   2. régi mentések törlése: az utolsó 7 mentés mindig megmarad, plusz a
#      vasárnapi mentésekből a legutóbbi 4 (heti mentések).
#
# Ütemezés élesben (a szerver crontabjában, hajnali 3:15-kor):
#   15 3 * * * cd /a/projekt/utvonala && scripts/mentes-automata.sh >> mentesek/mentes-naplo.txt 2>&1
#
# (Ha majd él az S3/R2 tárolás, ide kerül a felhőbe töltés is.)
set -euo pipefail
cd "$(dirname "$0")/.."

NAPI_MEGORZES=7
HETI_MEGORZES=4

echo "== Automata mentés: $(date '+%Y-%m-%d %H:%M:%S') =="
scripts/mentes.sh

# --- Megőrzés ---
cd mentesek
OSSZES=$(ls -1 webmotor-mentes-*.tar.gz 2>/dev/null | sort -r) || true
[ -z "$OSSZES" ] && exit 0

UJAK=$(printf '%s\n' "$OSSZES" | head -n "$NAPI_MEGORZES")
REGIEK=$(printf '%s\n' "$OSSZES" | tail -n +"$((NAPI_MEGORZES + 1))")
[ -z "$REGIEK" ] && exit 0

# A régiekből a vasárnapiak közül a legfrissebb HETI_MEGORZES darab marad.
VASARNAPIAK=""
while IFS= read -r fajl; do
  # A fájlnévben lévő dátumból (…-YYYYMMDD-HHMMSS.tar.gz) számoljuk a hét napját.
  DATUM=$(printf '%s' "$fajl" | sed -E 's/.*-([0-9]{8})-[0-9]{6}\.tar\.gz/\1/')
  [ ${#DATUM} -eq 8 ] || continue
  NAP=$(node -p "new Date('${DATUM:0:4}-${DATUM:4:2}-${DATUM:6:2}').getDay()" 2>/dev/null || echo "x")
  if [ "$NAP" = "0" ]; then VASARNAPIAK="$VASARNAPIAK$fajl"$'\n'; fi
done <<< "$REGIEK"
MEGTARTOTT_HETIEK=$(printf '%s' "$VASARNAPIAK" | head -n "$HETI_MEGORZES")

while IFS= read -r fajl; do
  [ -z "$fajl" ] && continue
  if printf '%s\n' "$UJAK" "$MEGTARTOTT_HETIEK" | grep -qx "$fajl"; then continue; fi
  echo "Régi mentés törlése: $fajl"
  rm -f "$fajl"
done <<< "$REGIEK"

echo "== Kész. Megőrzött mentések: =="
ls -1 webmotor-mentes-*.tar.gz
