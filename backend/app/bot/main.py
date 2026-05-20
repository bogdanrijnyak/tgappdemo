"""Polling bot entry — used in dev; prod uses webhook via FastAPI route."""
import asyncio
import logging

from aiogram import Bot

from app.bot.handlers import build_dispatcher, setup_menu_button
from app.config import get_settings

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("bot.main")


async def amain():
    settings = get_settings()
    bot = Bot(token=settings.BOT_TOKEN)
    dp = build_dispatcher()
    try:
        await setup_menu_button(bot)
    except Exception as e:
        log.warning("menu button failed: %s", e)
    await bot.delete_webhook(drop_pending_updates=True)
    log.info("bot polling startup")
    await dp.start_polling(bot)


def setup_webhook_command():
    """Run as one-off to register webhook in prod."""
    import asyncio
    import httpx
    settings = get_settings()
    url = f"{settings.PUBLIC_BASE_URL.rstrip('/')}/tg/hook"
    resp = httpx.post(
        f"https://api.telegram.org/bot{settings.BOT_TOKEN}/setWebhook",
        json={
            "url": url,
            "secret_token": settings.BOT_WEBHOOK_SECRET,
            "allowed_updates": ["message", "callback_query", "pre_checkout_query", "inline_query"],
        },
        timeout=15.0,
    )
    print(resp.json())


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "setup-webhook":
        setup_webhook_command()
    else:
        asyncio.run(amain())
