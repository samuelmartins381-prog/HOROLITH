#!/usr/bin/env bash
# Static guest-mode export for GitHub Pages.
# Temporarily moves server-only entry points (middleware, API routes,
# auth callback) out of the tree — they cannot exist in `output: export`
# builds — then restores them whatever the build outcome.
set -euo pipefail

cd "$(dirname "$0")/.."

STASH=".static-export-stash"
mkdir -p "$STASH"

restore() {
  [ -e "$STASH/middleware.ts" ] && mv "$STASH/middleware.ts" middleware.ts
  [ -e "$STASH/api" ] && mv "$STASH/api" app/api
  [ -e "$STASH/auth" ] && mv "$STASH/auth" app/auth
  rmdir "$STASH" 2>/dev/null || true
}
trap restore EXIT

[ -e middleware.ts ] && mv middleware.ts "$STASH/middleware.ts"
[ -e app/api ] && mv app/api "$STASH/api"
[ -e app/auth ] && mv app/auth "$STASH/auth"

STATIC_EXPORT=1 npx next build

echo "Static export written to out/"
