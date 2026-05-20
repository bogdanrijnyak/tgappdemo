import logging

from aiogram import Bot
from aiogram.types import Update
from fastapi import APIRouter, Header, HTTPException, Request, status

from app.bot.handlers import build_dispatcher
from app.config import get_settings

log = logging.getLogger("webhook")
router = APIRouter()
settings = get_settings()

_bot: Bot | None = None
_dp = build_dispatcher()


def _get_bot() -> Bot:
    global _bot
    if _bot is None:
        _bot = Bot(token=settings.BOT_TOKEN)
    return _bot


@router.post("/tg/hook")
async def telegram_webhook(
    request: Request,
    x_telegram_bot_api_secret_token: str | None = Header(default=None, alias="X-Telegram-Bot-Api-Secret-Token"),
):
    if x_telegram_bot_api_secret_token != settings.BOT_WEBHOOK_SECRET:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "bad secret")
    raw = await request.json()
    update = Update.model_validate(raw)
    bot = _get_bot()
    await _dp.feed_update(bot, update)
    return {"ok": True}
