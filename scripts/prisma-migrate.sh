#!/usr/bin/env sh

set -eu

BASELINE_MIGRATION="20251201000000_baseline"

echo "🗄️  Running Prisma migrations..."

set +e
output="$(npx prisma migrate deploy 2>&1)"
exit_code="$?"
set -e

echo "$output"

if [ "$exit_code" -eq 0 ]; then
  exit 0
fi

if echo "$output" | grep -q "P3005"; then
  echo "⚠️  Detected existing non-empty DB without migrations history (P3005). Baselining..."
  npx prisma migrate resolve --applied "$BASELINE_MIGRATION"
  npx prisma migrate deploy
  exit 0
fi

exit "$exit_code"
