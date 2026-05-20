"""One-shot: register Telegram webhook + configure the MenuButton.

Invoked by the `bot` container after the API stack is healthy. Sleeps after,
so the container restarts only on actual error, not on success.
"""
import asyncio
import os
import time

import httpx
from aiogram import Bot
from aiogram.types import MenuButtonWebApp, WebAppInfo


def main() -> None:
    bot_token = os.environ["BOT_TOKEN"]
    base = os.environ["PUBLIC_BASE_URL"].rstrip("/")
    secret = os.environ["BOT_WEBHOOK_SECRET"]
    mini_app = os.environ["MINI_APP_URL"]

    time.sleep(8)
    resp = httpx.post(
        f"https://api.telegram.org/bot{bot_token}/setWebhook",
        json={
            "url": f"{base}/tg/hook",
            "secret_token": secret,
            "allowed_updates": ["message", "callback_query", "pre_checkout_query", "inline_query"],
        },
        timeout=15.0,
    )
    print("setWebhook:", resp.json())

    async def set_menu() -> None:
        bot = Bot(token=bot_token)
        try:
            await bot.set_chat_menu_button(
                menu_button=MenuButtonWebApp(text="Showcase", web_app=WebAppInfo(url=mini_app))
            )
            print("menu button set")
        finally:
            await bot.session.close()

    asyncio.run(set_menu())

    # Idle forever — container stays up so docker compose treats this as the
    # bot side-car (no polling, webhook handles updates inside the api process).
    while True:
        time.sleep(3600)


if __name__ == "__main__":
    main()
