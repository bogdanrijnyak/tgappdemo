#!/usr/bin/env bash
# Pull latest, rebuild, restart. Used by CI.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/tgappdemo}"
cd "$APP_DIR"

git fetch origin
git reset --hard origin/main
docker compose pull || true
docker compose up -d --build
docker image prune -f >/dev/null 2>&1 || true

echo "==> deploy done"
curl -fsS http://localhost/health || true
