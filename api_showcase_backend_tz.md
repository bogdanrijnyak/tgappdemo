# ТЗ на бекенд: API Showcase — робочий демо-прототип

**Документ написаний на основі реального коду фронту** (33 файли .jsx із прототипу) — не з оригінального ТЗ v2.0. Завдання — *оживити* існуючий React-прототип точково, не будувати продакшен.

---

## 0. Контекст

### 0.1 Що ми робимо
Беремо існуючий фронт-прототип API Showcase і допилюємо бекенд так, щоб **під час живого демо нетехнічний глядач повірив, що це працює по-справжньому**. Це означає: ті місця, де зараз стоїть `setTimeout` чи `Math.random()` і де глядач *бачить* мок (хоча б тому, що картинка статична або значення завжди те саме) — мають отримати реальне підкріплення з сервера.

### 0.2 Що ми НЕ робимо
Це не v2.0-продакшен. **Відкидаємо все, чого глядач не побачить за 5 хвилин демо**:
- Telethon / userbot інтеграцію
- Реальну MTProto API колекціонних подарків (`payments.upgradeStarGift`, `getResaleStarGifts` тощо)
- Реальну бізнес-конект через `updateBotBusinessConnect`
- Реальну age verification (через документи / відео)
- Affiliate programs
- Mini App Store integration
- Custom verification badge
- Реальний TON-вивід (mock-екран із QR — це OK)

Все це залишаємо як **stub-ендпоінти** зі статичним JSON, який фронт уже знає.

### 0.3 Як читати цей документ
Кожна секція починається з **`[FE → BE]`** — що саме на фронті треба переключити з мока на сервер — і **`[BE]`** — що для цього бекенд має зробити.

---

## 1. Карта мокнутих місць на фронті

Це повний інвентар «вузлів зачеплення». Усе інше на фронті — чиста UI-логіка, бекенду її чіпати не треба.

| # | Файл | Зараз мокнуто | Видимо глядачу як мок? | Треба бекенду? |
|---|------|---------------|------------------------|----------------|
| 1 | `identity-viewport.jsx → WhoAmIDemo` | Hardcoded `userName` з tweak panel, `id: 802441099` | Ні (виглядає нативно) | **Так** — реальний `initData` |
| 2 | `demos.jsx → StorageInspector` (Cloud tab) | `setInterval` 7с мутує state + flash | **Так** — завжди той самий ключ | **Так** — справжній WS push |
| 3 | `demos.jsx → StarsPayment` | `await setTimeout 1400ms` → success | **Так** — нативне вікно оплати не з'являється | **Так** — реальний invoice |
| 4 | `demos.jsx → BiometricVault` | `Math.random() < 0.92` + статичний `secret_note` | **Так** — секрет завжди той самий | **Так** — реальне сховище |
| 5 | `haptic-lab.jsx → onShare` | `setTimeout 2200` тільки тогл tooltip | **Так** — друг не отримує паттерн | **Так** — prepared message |
| 6 | `system-share-premium.jsx → ShareToStoryDemo` | Статична inline-картинка, кнопка не відкриває композер | **Так** — нічого не відбувається | **Так** — генерація PNG |
| 7 | `system-share-premium.jsx → ShareMessageDemo` | Локальний bottom-sheet | **Так** — реального friend picker нема | **Так** — Bot API prepared msg |
| 8 | `system-share-premium.jsx → DownloadFileDemo` | Мок — нема справжнього файлу | **Так** | Можна додати — PNG обої |
| 9 | `app.jsx → Live viewer, Haptic Echo (cards)` | `LiveViewerDemo`, `HapticEchoDemo` — UI без реальної мережі | **Так — це wow-моменти** | **Так** — WebSocket |
| 10 | `collectible.jsx → CollectibleGifts` | Статичні `GIFT_PRESETS` (3 пресети) | Ні (виглядає переконливо) | Тільки stub-каталог |
| 11 | `business.jsx → BusinessProfileDemo` | Статичні дані | Ні | Stub-ендпоінт |
| 12 | `reactions.jsx → ReactionPicker` | Локальний state | Ні | Опціонально — лічильник в БД |
| 13 | `age-gate.jsx → AgeVerificationDemo` | `setTimeout` + завжди успіх | Ні (виглядає як native flow) | Stub-ендпоінт |
| 14 | `system-extras.jsx → CustomMethodInspector` | `MOCK_RESPONSES` об'єкт у фронті | Ні | Stub-ендпоінт із whitelist |
| 15 | `system-extras.jsx → HomeScreenDemo`, `QRScannerDemo`, etc. | Локальний state | Ні (SDK-only API) | Нічого |
| 16 | `app.jsx → progress` | `completedRef.current.add(card.id)` | Ні | Опціонально — персист |

**Підсумок**: реально треба покрити **рядки 1–9**. Решта — статичні стаб-ендпоінти, які повертають JSON фронту і йдуть далі.

---

## 2. Архітектура

Мінімально життєздатний стек, без надлишку:

```
┌──────────────────────────────────────────────────────────────┐
│           Telegram client → Mini App (React)                 │
│           initData у заголовку X-Init-Data                   │
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTPS + WSS
                             ▼
                    ┌────────────────┐
                    │  nginx (TLS)   │
                    └───────┬────────┘
                            ▼
                    ┌────────────────┐         ┌──────────────┐
                    │   FastAPI      │◄───────►│   Redis 7    │
                    │  REST + WS     │ pubsub  │ pubsub+кеш   │
                    └───┬──────┬─────┘         └──────────────┘
                        │      │
                ┌───────▼──┐ ┌─▼───────────┐
                │ Postgres │ │  Celery     │──► PNG generation
                │   16     │ │  (Redis     │    R2 / MinIO
                └──────────┘ │   broker)   │
                             └─────────────┘
                                  ▲
                                  │
                          ┌───────┴────────┐
                          │ aiogram 3.x    │
                          │ bot (webhook)  │
                          └────────────────┘
```

### 2.1 Стек
- **FastAPI 0.110+** — REST + WebSocket
- **PostgreSQL 16** — або SQLite для першого запуску, переходимо на PG коли потрібен Celery
- **Redis 7** — pub/sub, rate-limit, session cache
- **aiogram 3.x** — бот (webhook у проді, long-polling у dev через `ngrok`/`cloudflared`)
- **Celery 5** — генерація картинок для Stories / Download File. **Тільки для цього** — все інше синхронне
- **S3-сумісне** — Cloudflare R2 у проді, MinIO у dev
- **Pillow** — генерація PNG
- **Pydantic v2** — схеми
- **PyJWT** — JWT

### 2.2 Чого в стеку немає (і чому)
- **Telethon-воркера**: для демо непотрібен. Колекціонні гіфти, бізнес-конект, MTProto-фічі — все мокнуто
- **Окремого WebSocket-сервера**: FastAPI вміє WS нативно
- **Окремого черговика для не-PNG задач**: не потрібен
- **Окремого admin-API**: для демо забагато

### 2.3 Розгортання
- **dev**: `docker compose up` піднімає весь стек локально, `cloudflared tunnel` пробрасує до Telegram
- **prod-demo**: один VPS 2 CPU / 4 GB RAM достатньо для презентації; `docker compose` той самий, nginx-проксі з Let's Encrypt
- **Webhook URL**: `https://<demo-host>/tg/hook`, секрет у `setWebhook(secret_token=...)`

---

## 3. Auth: initData → JWT

### 3.1 [FE → BE]
Фронт у `identity-viewport.jsx → WhoAmIDemo` зараз читає `window.__TG_USER_NAME__` із tweak panel. Треба:
1. На старті Mini App фронт викликає `POST /api/auth/verify` із заголовком `X-Init-Data: <raw initData string>`
2. У відповідь — JWT (TTL 15 хв) + `user` об'єкт
3. JWT кладеться в усі подальші запити як `Authorization: Bearer …`
4. WebSocket підключення — `wss://host/ws?token=<JWT>`

### 3.2 [BE] Валідація initData (HMAC-SHA256)

```python
import hmac, hashlib, time
from urllib.parse import parse_qsl

def verify_init_data(init_data: str, bot_token: str, max_age: int = 86400) -> dict:
    parsed = dict(parse_qsl(init_data, strict_parsing=True))
    received = parsed.pop("hash")
    data_check = "\n".join(f"{k}={v}" for k, v in sorted(parsed.items()))
    secret = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    calc = hmac.new(secret, data_check.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(calc, received):
        raise ValueError("invalid signature")
    if int(time.time()) - int(parsed["auth_date"]) > max_age:
        raise ValueError("expired")
    # parsed["user"] — JSON-рядок з полями id, first_name, ...
    import json
    return {**parsed, "user": json.loads(parsed["user"])}
```

### 3.3 [BE] Ендпоінти

| Метод | URL | Призначення |
|---|---|---|
| `POST` | `/api/auth/verify` | initData → JWT + user-payload |
| `POST` | `/api/auth/refresh` | новий JWT по свіжому initData |
| `GET`  | `/api/me` | поточний користувач (із JWT) |

JWT payload: `{sub: user_id, jti: uuid4, exp, platform}`. Підпис HS256, секрет з env.

### 3.4 [BE] Dev-режим (без Telegram)
Якщо `ENV=dev` і прийшов `X-Init-Data: __dev__:<user_id>:<name>` — повертати фейк-юзера без HMAC. Це потрібно для роботи з прототипом у браузері без Telegram-клієнта.

---

## 4. Hero #1: Stars-платіж з auto-refund

Це найскладніша інтеграція, але обов'язкова — `demos.jsx → StarsPayment` зараз мокає 1.4-секундним setTimeout, і це **видно** глядачу (нативне вікно оплати не виплигує).

### 4.1 [FE → BE] Що змінюється на фронті
У `StarsPayment.confirm()` замість `setTimeout(1400)`:
1. `POST /api/stars/invoice` → отримує `{invoice_url, payment_id}`
2. Викликає `Telegram.WebApp.openInvoice(invoice_url, statusCb)`
3. Підписується на WebSocket-канал `payment:{payment_id}` (або просто слухає вже існуючий `payment_push`)
4. Коли приходить `{type: "payment_completed", payment_id}` → стає `stage = 'success'`
5. Refund-таймер на фронті стартує локально (60с), але реальний refund робить бекенд

### 4.2 [BE] Ендпоінти

| Метод | URL | Призначення |
|---|---|---|
| `POST` | `/api/stars/invoice` | створити invoice через Bot API `createInvoiceLink` |
| `POST` | `/api/stars/refund/{payment_id}` | (адмін) ручний refund |

Body для `POST /api/stars/invoice`:
```json
{ "purpose": "demo_heart", "amount_stars": 1 }
```
Відповідь:
```json
{ "payment_id": "uuid", "invoice_url": "https://t.me/$slug" }
```

### 4.3 [BE] Що робить aiogram-бот
1. Слухає `pre_checkout_query` → одразу `bot.answer_pre_checkout_query(id, ok=True)`
2. Слухає `successful_payment` → пише в БД `payments` запис із `telegram_payment_charge_id`, статус `paid`
3. Публікує в Redis `payment_push:{user_id}` подію `{type: "payment_completed", payment_id, amount}`
4. Запускає Celery-таску `refund_payment_after.apply_async(args=[payment_id], countdown=60)`

### 4.4 [BE] Celery таска auto-refund

```python
@celery.task
def refund_payment_after(payment_id: str):
    p = db.get_payment(payment_id)
    if p.status != "paid" or p.refunded_at:
        return
    bot.refund_star_payment(
        user_id=p.user_id,
        telegram_payment_charge_id=p.telegram_payment_charge_id,
    )
    db.mark_refunded(payment_id)
```

### 4.5 Edge cases
- Rate-limit `/api/stars/invoice`: **5/хв на користувача** (Redis sliding window)
- Якщо `purpose != "demo_heart"` → 400 (whitelist)
- Якщо `amount_stars > 10` → 400 (захист від випадкового великого списання)
- Refund при недоступності API: писати помилку в логи, ретраїти 3 рази з backoff

---

## 5. Hero #2: CloudStorage proxy + multi-device sync

`demos.jsx → StorageInspector` має `setInterval` кожні 7с, який імітує "пуш із другого пристрою". Це видно як мок, бо завжди той самий патерн. Треба замінити на справжню синхронізацію.

### 5.1 [FE → BE] Що змінюється
1. На вхід у Storage Inspector — `GET /api/cloud` → список ключів
2. На додавання — `PUT /api/cloud/{key}` із value
3. WebSocket-підписка автоматично слухає `cloud_sync:{user_id}` — фронт чує push і робить `getKeys`/`getItem` (як у реальному SDK)
4. **Видаляємо `setInterval` 7с** із `useEffect`. Замість нього — реальні push від WS

### 5.2 [BE] Ендпоінти

| Метод | URL | Призначення |
|---|---|---|
| `GET` | `/api/cloud` | список усіх ключів користувача |
| `GET` | `/api/cloud/{key}` | одне значення |
| `PUT` | `/api/cloud/{key}` | `{value: string}` |
| `DELETE` | `/api/cloud/{key}` | видалити |

### 5.3 [BE] Ліміти (фактичні, як на фронті в `STORAGE_LIMITS`)
- **1024 ключів** на користувача → 1025-й → `409 Conflict {error: "key_limit_exceeded"}`
- **4096 байт** на value → > 4096 → `413 Payload Too Large`
- Ключ: `^[a-zA-Z0-9_]{1,64}$` → інше → `400`

### 5.4 [BE] Multi-device sync
1. При `PUT/DELETE` після успішного запису в БД → `redis.publish(f"cloud_sync:{user_id}", {"type": "cloud_storage_updated", "key": k, "action": "set"|"delete"})`
2. WebSocket handler підписаний на канал → проксує клієнтам цього `user_id` (можуть бути 2+ паралельних сесій)
3. **Фронт сам викликає `getKeys`** після push — як це робив би справжній Telegram SDK

### 5.5 [BE] DeviceStorage та SecureStorage
- **DeviceStorage** — нічого не робимо. Це браузерний localStorage, прив'язаний до пристрою; синку нема. Фронт зберігає локально
- **SecureStorage** — для Vault демо (див. §7). Окремий ендпоінт, не плутати з cloud

---

## 6. Realtime: WebSocket

Це найважливіший wow-момент після Stars-платежу. Дві картки в галереї — `Live viewer counter` і `Haptic Echo` — без WS просто не працюють.

### 6.1 [BE] Протокол WS

URL: `wss://host/ws?token=<JWT>`

Heartbeat: фронт шле `{"type":"ping"}` кожні 25с, сервер відповідає `{"type":"pong"}`. Idle timeout 90с.

#### Сервер → клієнт
```json
{ "type": "presence", "online": 137 }
{ "type": "cloud_storage_updated", "key": "theme_pref", "action": "set" }
{ "type": "payment_completed", "payment_id": "uuid", "amount": 1 }
{ "type": "haptic_echo", "style": "medium", "from_device": "iphone_15" }
{ "type": "secure_storage_cleared" }
```

#### Клієнт → сервер
```json
{ "type": "ping" }
{ "type": "identify", "device_id": "ios_402" }
{ "type": "haptic_emit", "target_device": "any", "style": "heavy" }
```

### 6.2 [BE] Канали Redis pub/sub

| Канал | Що публікується |
|---|---|
| `presence:global` | оновлення лічильника (раз на 2с) |
| `cloud_sync:{user_id}` | зміни CloudStorage |
| `payment_push:{user_id}` | завершені платежі |
| `haptic_echo:{user_id}` | сигнали Haptic Echo між пристроями користувача |

### 6.3 [BE] Live counter
- При connect: `INCR presence:count`, при disconnect: `DECR`
- Окрема корутина броадкастить значення в `presence:global` кожні 2с
- Якщо лічильник < 5 — додавати випадковий «штучний» оффсет 8–30 для демо-вигляду. **Чесне число при < 5 виглядає жалюгідно**, тому додаємо «синтетичних глядачів». Прапор `SHOW_FAKE_PRESENCE=true` в env

### 6.4 [BE] Haptic Echo
1. Фронт A: `{type: "haptic_emit", target_device: "any", style: "heavy"}`
2. Сервер: `redis.publish(f"haptic_echo:{user_id}", {...style, from_device: A})`
3. Інші WS-сесії того ж `user_id` отримують пуш → фронт викликає `Telegram.WebApp.HapticFeedback.impactOccurred(style)`
4. Затримка має бути ≤ 300мс — Redis локальний, тому укладаємось

### 6.5 [BE] Деталі імплементації
- Реєстр активних з'єднань — `dict[user_id, set[WebSocket]]` у пам'яті процесу
- Якщо проксі/балансер нагороджує stick session — OK, але це single-instance. **Для демо одного інстансу достатньо**
- При падінні WS — Redis subscription не зависає, бо корутина прив'язана до connection lifetime

---

## 7. Hero #3: Biometric Vault — стояще сховище секрету

`demos.jsx → BiometricVault` зараз показує **захардкоджений** `secret_note: "Build with Telegram → ship in a weekend."`. Це найдешевша корекція — серверне сховище одного секрету на користувача.

### 7.1 [FE → BE]
1. Після успішної біометрії — `GET /api/vault` із JWT
2. У відповідь — `{secret_note: "..."}` (розшифроване)
3. Якщо нема — пропонуємо записати: `PUT /api/vault {secret_note: "..."}`

### 7.2 [BE] Ендпоінти

| Метод | URL | Призначення |
|---|---|---|
| `GET` | `/api/vault` | віддати секрет користувача |
| `PUT` | `/api/vault` | записати/перезаписати |
| `DELETE` | `/api/vault` | видалити |

### 7.3 [BE] Шифрування
- Використовуємо `cryptography.fernet.Fernet` із ключем у env (`VAULT_FERNET_KEY`)
- У БД зберігаємо `vault_secrets.value` як `bytea`
- Якщо ключ ротується — старі секрети стають недоступними (для демо це прийнятно)

---

## 8. Hero pattern share: Haptic Lab → prepared inline message

`haptic-lab.jsx → onShare(pattern)` зараз тільки тогл tooltip. Має реально надсилати паттерн другу.

### 8.1 [FE → BE]
1. Натиск `Share to friend` → `POST /api/haptic-patterns {steps: [...]}` → `{id, share_message_id}`
2. Фронт викликає `Telegram.WebApp.shareMessage(share_message_id)`
3. Native sheet "Send to..." відкривається з повідомленням «Try my haptic pattern → t.me/bot?startapp=p_<id>»

### 8.2 [BE] Ендпоінти

| Метод | URL | Призначення |
|---|---|---|
| `POST` | `/api/haptic-patterns` | створити, повернути id + prepared msg id |
| `GET` | `/api/haptic-patterns/{id}` | прочитати паттерн (для глядача який відкрив посилання) |

### 8.3 [BE] Створення prepared inline message
Bot API метод `savePreparedInlineMessage`:
```python
result = await bot.save_prepared_inline_message(
    user_id=user_id,
    result=InlineQueryResultArticle(
        id=pattern_id,
        title="Haptic pattern",
        description="Tap to feel my rhythm",
        input_message_content=InputTextMessageContent(
            message_text=f"🎵 Try my haptic pattern:\nt.me/{BOT_USERNAME}?startapp=p_{pattern_id}",
        ),
    ),
    allow_user_chats=True, allow_bot_chats=True,
    allow_group_chats=True, allow_channel_chats=True,
)
# result.id ← це share_message_id для фронту
```

### 8.4 [BE] Deep-link обробка
Бот `/start p_<pattern_id>` → інлайн-кнопка `Open` із web_app_url, що містить `startapp=p_<pattern_id>`. Фронт читає `start_param` із `initDataUnsafe` і завантажує паттерн через `GET /api/haptic-patterns/{id}`.

---

## 9. Share to Story: генерація 1080×1920 PNG

`system-share-premium.jsx → ShareToStoryDemo` зараз показує inline-картинку (180px), кнопка `Open Story composer` нічого не робить. Треба згенерувати справжню картинку і запустити нативний композер.

### 9.1 [FE → BE]
1. Натиск `Open Story composer` → `POST /api/share/story {template: "collectible", preset: "bloom"}`
2. Відповідь миттєва: `{task_id: uuid}`
3. Фронт опитує `GET /api/share/story/{task_id}` (поллінг 500мс, до 8 спроб) → `{status: "done", url: "https://r2..."}`
4. Викликає `Telegram.WebApp.shareToStory(url, {text: "...", widget_link: {url: "t.me/bot", name: "Open showcase"}})`

### 9.2 [BE] Ендпоінти

| Метод | URL | Призначення |
|---|---|---|
| `POST` | `/api/share/story` | замовити генерацію |
| `GET` | `/api/share/story/{task_id}` | статус + URL |

### 9.3 [BE] Celery таска
```python
@celery.task
def generate_story_png(task_id, user_id, template, preset_id):
    from PIL import Image, ImageDraw, ImageFont
    img = Image.new("RGB", (1080, 1920), color=GIFT_PRESETS[preset_id]["edge"])
    draw = ImageDraw.Draw(img)
    # radial gradient mock — заливка з центру
    # symbol (✦ / ✸ / ❋) великим шрифтом
    # ім'я користувача
    # серійник #001892
    # via @APIShowcaseBot — внизу
    buf = io.BytesIO()
    img.save(buf, "PNG")
    key = f"stories/{user_id}/{task_id}.png"
    s3.put_object(Bucket="showcase-stories", Key=key, Body=buf.getvalue(), ACL="public-read")
    db.update_task(task_id, status="done", url=f"https://{R2_HOST}/{key}")
```

### 9.4 [BE] S3-сумісне сховище
- Бакет `showcase-stories` — публічний read
- Pre-signed URL не потрібні (картинка для Story має бути загальнодоступна для нативного композера)
- Lifecycle: автоматичне видалення через 7 днів (сторіс ефемерні)
- Pillow + кешований шрифт SF Pro у Docker-image

### 9.5 [BE] Download File (опціонально)
Той самий патерн — `POST /api/share/download {template: "wallpaper", user_name}` → 1170×2532 PNG → `Telegram.WebApp.downloadFile`.

---

## 10. Stub-ендпоінти (статичні дані)

Усе, що нижче — повертає **зашитий у код** JSON. Бекенду нічого не обчислює, але фронт думає, що це справжній сервер. Це створює відчуття «всі ці фічі підключені», без витрат часу на реальну MTProto.

### 10.1 Каталог колекціонних подарків
`GET /api/gifts/catalog` → масив із 3 пресетів `GIFT_PRESETS` (cosmic, ember, bloom) — копія об'єкта з `data.jsx`. Фронт `CollectibleGifts` бере звідси замість константи.

### 10.2 Бізнес-профіль
`GET /api/business/profile` → мок із полями `hours`, `location`, `quick_replies`, `greeting`, `away`, `intro`, `chat_link`. Просто статичний JSON. Можна додати випадковий offset «X хвилин тому» в полі `updated_at` — додає реалізму.

### 10.3 Реакції
`POST /api/reactions/send {target_id, emoji, paid?}` → `{ok: true, totals: {...}}`. Можна тримати лічильники в Redis із TTL 1 година — глядач побачить, як інші демо-користувачі реагують.

### 10.4 Age verification
`POST /api/age-verify {country, min_age}` → 1.5с затримка → `{verified: true, expires_at: "+30d"}`. Завжди успіх. Фронт ховає gate.

### 10.5 Custom Method RPC
`POST /api/custom-method {method, params}` → відповідь зі whitelist:
- `getInternalState` → `{state: "ready", items: 42, version: "2.1.0"}`
- `getRequestedContact` → `{phone: "+380 50 555 04 12", name: "Alex Carter"}`
- `getCurrentTheme` → `{mode: "light", accent: "#2481cc", platform: "ios"}`
- Все інше → `{error: "METHOD_NOT_ALLOWED"}`

Латенсі — `await asyncio.sleep(0.3 + random.random() * 0.3)` для реалістичної кривої.

### 10.6 Launch mode
Не окремий ендпоінт. Просто: при `POST /api/auth/verify` сервер дивиться на `parsed["start_param"]` і повертає в JWT `launch_mode` із сімки (`mini-app | direct | attach | side | menu | inline-btn | inline-mode`) на основі патерну в `start_param`. Фронт читає це в payload JWT.

### 10.7 Progress persistence (опціонально)
- `GET /api/progress` → `{completed: ["who", "theme", "haptic"]}`
- `POST /api/progress {card_id}` → додає до set
- Якщо не реалізуємо — фронт продовжує тримати локально в `completedRef`. Втрата при reload, але для демо OK

---

## 11. Бот (aiogram 3.x)

### 11.1 Команди
- `/start` → текст «Hey! Tap below to open the showcase» + inline-кнопка `Open showcase` з `web_app=WebAppInfo(url=MINI_APP_URL)`
- `/start p_<id>` → те саме, але `web_app` URL із `?startapp=p_<id>` (для шарингу хаптичних паттернів)
- `/start` із іншими payload → ігноруємо, відкриваємо звичайний showcase

### 11.2 MenuButton
При запуску бота:
```python
await bot.set_chat_menu_button(
    menu_button=MenuButtonWebApp(text="Showcase", web_app=WebAppInfo(url=MINI_APP_URL))
)
```

### 11.3 Хендлери
| Подія | Що робимо |
|---|---|
| `pre_checkout_query` | `answer_pre_checkout_query(ok=True)` |
| `successful_payment` | INSERT в `payments`, publish `payment_push:{user_id}`, schedule refund |
| `inline_query` | Повертати 1–2 заздалегідь приготовлені статті (для switchInlineQuery demo) |
| Webhook signature | Перевіряти `X-Telegram-Bot-Api-Secret-Token` |

### 11.4 Custom method handler через MTProto
Bot API не вміє приймати custom method прямо — це йде через `bots.invokeWebViewCustomMethod`. **Для демо це обходимо**: фронт стукає напряму в наш REST `/api/custom-method`. У реальній продакшен-версії — через Telethon-міст. Тут — пропускаємо.

---

## 12. БД: мінімальна схема PostgreSQL

```sql
CREATE TABLE users (
  id              BIGSERIAL PRIMARY KEY,
  tg_id           BIGINT UNIQUE NOT NULL,
  username        TEXT,
  first_name      TEXT,
  last_name       TEXT,
  language_code   TEXT,
  is_premium      BOOLEAN DEFAULT FALSE,
  photo_url       TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  last_seen_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE cloud_storage (
  user_id    BIGINT REFERENCES users(id) ON DELETE CASCADE,
  key        TEXT NOT NULL,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, key)
);
CREATE INDEX idx_cloud_user ON cloud_storage(user_id);

CREATE TABLE vault_secrets (
  user_id      BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  ciphertext   BYTEA NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payments (
  id                          UUID PRIMARY KEY,
  user_id                     BIGINT REFERENCES users(id),
  purpose                     TEXT NOT NULL,
  amount_stars                INT NOT NULL,
  telegram_payment_charge_id  TEXT UNIQUE,
  status                      TEXT NOT NULL,         -- 'pending' | 'paid' | 'refunded'
  refunded_at                 TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE haptic_patterns (
  id           UUID PRIMARY KEY,
  user_id      BIGINT REFERENCES users(id),
  steps        JSONB NOT NULL,         -- ["soft", "medium", null, ...]
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE story_tasks (
  id          UUID PRIMARY KEY,
  user_id     BIGINT REFERENCES users(id),
  template    TEXT NOT NULL,
  preset      TEXT,
  status      TEXT NOT NULL,           -- 'pending' | 'done' | 'failed'
  url         TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Опціонально
CREATE TABLE showcase_progress (
  user_id     BIGINT REFERENCES users(id),
  card_id     TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, card_id)
);
```

Це **6 таблиць**. Усе. Жодних `business_connections`, `gifts`, `reactions`, `age_verifications` — це stub-ендпоінти.

---

## 13. Безпека (мінімально достатньо)

- **JWT TTL 15 хв** — refresh через свіжий initData
- **Rate-limit (Redis sliding window)**:
  - 60 RPS глобально на користувача
  - 5/хв на `POST /api/stars/invoice` (захист від спаму)
  - 30/хв на `POST /api/custom-method`
- **CORS**: тільки `https://web.telegram.org`, `https://*.telegram.org`, домен Mini App
- **CSP**: `default-src 'self'; script-src 'self' https://telegram.org`
- **Webhook signature**: перевірка `X-Telegram-Bot-Api-Secret-Token` на `/tg/hook`
- **Vault encryption**: Fernet ключ у env, ротація не передбачена
- **HTTPS only** — Mini App не запускається без TLS

---

## 14. Структура репозиторію

```
backend/
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── alembic/                # міграції
├── app/
│   ├── main.py             # FastAPI + lifespan
│   ├── config.py           # pydantic-settings
│   ├── deps.py             # current_user, db, redis
│   ├── auth.py             # initData validation
│   ├── routers/
│   │   ├── auth.py
│   │   ├── cloud.py
│   │   ├── vault.py
│   │   ├── stars.py
│   │   ├── share.py
│   │   ├── patterns.py
│   │   ├── stubs.py        # gifts/catalog, business, reactions, age, custom-method
│   │   └── ws.py
│   ├── bot/
│   │   ├── main.py         # aiogram entry
│   │   ├── handlers.py     # /start, payments, inline
│   │   └── webhook.py
│   ├── tasks/
│   │   ├── celery_app.py
│   │   ├── story_png.py
│   │   └── refund.py
│   ├── models/             # SQLAlchemy
│   ├── schemas/            # Pydantic v2
│   └── services/
│       ├── redis_pubsub.py
│       └── presence.py
├── tests/
└── README.md
```

---

## 15. Чек-ліст «оживлення» — у порядку пріоритету

Якщо часу мало — робимо зверху вниз, зупиняємось де закінчиться:

1. ✅ **Auth (initData → JWT)** — без цього нічого не працює
2. ✅ **WebSocket базовий + presence лічильник** — найдешевший wow-момент
3. ✅ **Stars-платіж із auto-refund** — найгучніший wow-момент
4. ✅ **CloudStorage CRUD + sync** — другий wow-момент
5. ✅ **Vault secret storage** — дешево і прибирає очевидний мок
6. ✅ **Bot /start + MenuButton + webhook** — базова інфраструктура
7. ✅ **Haptic Echo через WS** — wow-момент, дуже дешевий якщо вже є WS
8. ⚪ **Story PNG generation + R2** — потребує Celery + S3, але дуже видимий
9. ⚪ **Prepared inline message (haptic pattern + share message)** — Bot API
10. ⚪ **Download File (wallpaper PNG)** — той самий патерн що і Story
11. ⚪ **Stub-ендпоінти (gifts, business, reactions, age, RPC)** — пишеться за день
12. ⚪ **Progress persistence** — приємно, але не критично

Пункти 1–7 = **MVP, який вже виглядає переконливо**. Пункти 8–12 — полір.

---

## 16. Що НЕ робимо (явно)

- ❌ Telethon / userbot — повна відсутність
- ❌ MTProto колекціонні гіфти — каталог зашитий, операції upgrade/transfer/resell мокані стабами
- ❌ Бізнес-конект через `updateBotBusinessConnect` — статичний JSON
- ❌ Age verification через документ/відео — стаб
- ❌ Affiliate programs — стаб
- ❌ Mini App Store integration — стаб
- ❌ Custom verification badge — стаб
- ❌ TON-вивід реальний — мок-екран з фейк QR
- ❌ Production-level моніторинг, метрики, sentry — для демо достатньо logger.info
- ❌ Multi-instance scaling — single VPS на демо
- ❌ Telethon-міст для custom method — фронт стукає напряму в REST

---

## 17. Estimate

| Блок | Час |
|---|---|
| Auth + JWT + dev-mode | 0.5 дня |
| WebSocket + presence + Redis pubsub | 1 день |
| Stars invoice + webhook + Celery refund | 1.5 дня |
| CloudStorage CRUD + sync | 0.5 дня |
| Vault | 0.5 дня |
| Bot (aiogram, /start, MenuButton, webhook) | 0.5 дня |
| Haptic Echo через WS | 0.5 дня |
| Story PNG generation + R2 | 1 день |
| Prepared inline messages | 0.5 дня |
| Download File | 0.5 дня |
| Stub-ендпоінти (всі 5) | 0.5 дня |
| Docker Compose + nginx + deploy на VPS | 1 день |
| Інтеграційне тестування + полір | 1 день |

**Разом: ≈ 10 робочих днів для одного backend-розробника**. Якщо різати тільки MVP (пункти 1–7 із чек-ліста) — **5 днів**.

---

**Кінець ТЗ.** Документ написаний строго під реальний код фронту з ZIP'а — нічого не вигадано «про запас». Якщо щось додасться у фронт-частині — синхронізувати цей ТЗ.
