# tgappdemo — API Showcase Mini App + backend

Live demo: https://demo.dupa.online

This repo wires a static React prototype (in `frontend/`) to a FastAPI + Postgres + Redis + Celery + aiogram backend (in `backend/`) so the demo's mocked spots — Stars payment, CloudStorage sync, biometric vault, Story PNG, presence counter, haptic echo — actually round-trip through real services.

See `api_showcase_backend_tz.md` for the full technical spec.

## Repo layout
```
backend/      FastAPI app, aiogram bot, Celery worker, alembic
frontend/     The original prototype (.html + 24 .jsx) + api-client.js bridge
nginx/        site.conf (TLS), site-http-only.conf (bootstrap), frontend.conf
deploy/       init-server.sh (first-time TLS), deploy.sh (CI), renew-cert.sh
docker-compose.yml
```

## Local dev

```bash
cp .env.example .env
# edit BOT_TOKEN, secrets

docker compose up --build
# frontend: http://localhost   (no TLS — uses site-http-only via override)
```

For Telegram polling (no public URL) use `python -m app.bot.main` inside the backend container — but the prototype is just a browser SPA, so opening `http://localhost/` with `__dev__:` initData works for everything except real Stars invoices.

## Production deploy

First time on a fresh VPS (AlmaLinux 8, root + `deploy` user):

```bash
ssh deploy@<vps>
sudo mkdir -p /opt/tgappdemo && sudo chown -R deploy:deploy /opt/tgappdemo
cd /opt/tgappdemo
git clone https://github.com/<owner>/tgappdemo.git .
cp .env.example .env && nano .env   # fill secrets
DOMAIN=demo.dupa.online LE_EMAIL=you@example.com ./deploy/init-server.sh
```

Subsequent deploys are pushed by CI (`.github/workflows/deploy.yml`) — see workflow.

## Endpoints (high level)

| route | what |
|---|---|
| `POST /api/auth/verify` | initData (HMAC) → JWT + user payload |
| `GET  /api/me` | current user |
| `GET/PUT/DELETE /api/cloud[/{key}]` | CloudStorage proxy (1024 keys × 4 KB) |
| `GET/PUT/DELETE /api/vault` | Fernet-encrypted single secret per user |
| `POST /api/stars/invoice` | `createInvoiceLink` → invoice_url + payment_id |
| `POST /api/share/story` + `GET /api/share/story/{task_id}` | async 1080×1920 PNG (Celery + S3) |
| `POST /api/share/download` | 1170×2532 wallpaper PNG |
| `POST /api/haptic-patterns` | save pattern + savePreparedInlineMessage |
| `POST /api/custom-method` | whitelisted RPC stub |
| `GET  /api/gifts/catalog`, `/api/business/profile`, `/api/reactions/send`, `/api/age-verify` | static stubs |
| `GET  /api/progress`, `POST /api/progress` | per-user showcase progress |
| `WS   /ws?token=<JWT>` | presence, cloud_storage_updated, payment_completed, haptic_echo |
| `POST /tg/hook` | Telegram webhook (header `X-Telegram-Bot-Api-Secret-Token`) |

## Auth flow

1. Mini App boots → `frontend/api-client.js` reads `Telegram.WebApp.initData` (or builds a `__dev__:` payload in browser) → `POST /api/auth/verify` with `X-Init-Data: ...`.
2. Backend HMAC-validates initData against `BOT_TOKEN`, upserts the user, returns `{ token, user, launch_mode }` (JWT TTL 15 min).
3. Client stores the token in memory + localStorage, opens `wss://.../ws?token=<JWT>`, and tags all REST calls with `Authorization: Bearer <JWT>`.

## Frontend wire-up summary

The original `.jsx` files keep their full mock fallback so the prototype still runs in plain Chrome. When `window.API.isReady()`:

| file | what changes |
|---|---|
| `identity-viewport.jsx` | `WhoAmIDemo` reads real `tg_id`, `first_name`, etc. |
| `demos.jsx` | `StorageInspector` subscribes to `cloud_storage_updated`; `StarsPayment` calls `/api/stars/invoice` + `Telegram.WebApp.openInvoice` + waits for `payment_completed`; `BiometricVault` reads from `/api/vault` |
| `buttons-launch.jsx` | `LiveViewerDemo` subscribes to `presence`; `HapticEchoDemo` emits + receives over WS |
| `haptic-lab.jsx` | Share button hits `/api/haptic-patterns` + `Telegram.WebApp.shareMessage` |
| `system-share-premium.jsx` | `ShareToStoryDemo` triggers the Celery PNG job + `shareToStory`; `DownloadFileDemo` runs the wallpaper variant + `downloadFile` |

## Operating tips

- Cert renewal: `deploy/renew-cert.sh` (drop in cron weekly).
- Per the spec, **a single VPS instance is fine** — WS uses an in-process connection registry. Don't scale horizontally without a sticky balancer.
- `SHOW_FAKE_PRESENCE=true` adds 8–30 synthetic viewers when fewer than 5 are connected (per §6.3).
- The `bot` container only handles `setWebhook` + `MenuButton` at startup, then idles. All updates land on `/tg/hook` inside the `api` container.
