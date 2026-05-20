#!/usr/bin/env bash
# Cron-friendly Let's Encrypt renewal hook.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/tgappdemo}"
cd "$APP_DIR"

docker run --rm \
  -v "$APP_DIR/nginx/letsencrypt:/etc/letsencrypt" \
  -v "$APP_DIR/nginx/webroot:/var/www/certbot" \
  certbot/certbot:latest renew --webroot -w /var/www/certbot --quiet

docker compose exec -T nginx nginx -s reload || docker compose restart nginx
