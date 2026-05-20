#!/usr/bin/env bash
# Run on the VPS the first time we deploy. Idempotent — safe to re-run.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/tgappdemo}"
DOMAIN="${DOMAIN:-demo.dupa.online}"
LE_EMAIL="${LE_EMAIL:-admin@dupa.online}"

cd "$APP_DIR"

if [[ ! -f .env ]]; then
  echo "ERR: $APP_DIR/.env not found. Create it from .env.example before running."
  exit 1
fi

mkdir -p nginx/letsencrypt nginx/webroot

# Stage 1: bring everything up with the HTTP-only nginx config so certbot can
# answer the ACME challenge over port 80.
echo "==> stage 1: starting stack with HTTP-only nginx"
cp nginx/site-http-only.conf nginx/site.conf.bak 2>/dev/null || true
docker compose -f docker-compose.yml -f deploy/docker-compose.bootstrap.yml up -d --build

echo "==> waiting for nginx to answer port 80"
for i in $(seq 1 30); do
  if curl -fsS "http://${DOMAIN}/.well-known/acme-challenge/probe" >/dev/null 2>&1 \
     || curl -fsS -o /dev/null -w '%{http_code}' "http://${DOMAIN}/" | grep -qE '^(200|301|302|404)$'; then
    break
  fi
  sleep 2
done

echo "==> issuing Let's Encrypt certificate for ${DOMAIN}"
docker run --rm \
  -v "$APP_DIR/nginx/letsencrypt:/etc/letsencrypt" \
  -v "$APP_DIR/nginx/webroot:/var/www/certbot" \
  certbot/certbot:latest certonly \
    --webroot -w /var/www/certbot \
    --email "${LE_EMAIL}" --agree-tos --no-eff-email --non-interactive \
    -d "${DOMAIN}"

echo "==> stage 2: restarting with full TLS config"
docker compose -f docker-compose.yml up -d --build

echo "==> done. Try: https://${DOMAIN}/health"
