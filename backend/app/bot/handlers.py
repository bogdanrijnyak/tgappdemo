import logging
import uuid

from aiogram import Bot, Dispatcher, F, Router
from aiogram.filters import CommandStart
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    LabeledPrice,
    Message,
    MenuButtonWebApp,
    PreCheckoutQuery,
    WebAppInfo,
)

from app.config import get_settings
from app.db import SessionLocal
from app.deps import get_redis
from app.models import Payment
from app.services.redis_pubsub import channel_payment, publish

log = logging.getLogger("bot")
settings = get_settings()
router = Router()


def _open_kb(start_param: str | None = None) -> InlineKeyboardMarkup:
    url = settings.MINI_APP_URL
    if start_param:
        url = f"{url}?startapp={start_param}"
    return InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="Open showcase", web_app=WebAppInfo(url=url))]]
    )


@router.message(CommandStart())
async def cmd_start(message: Message):
    payload = ""
    if message.text and " " in message.text:
        payload = message.text.split(" ", 1)[1].strip()
    sp = payload if payload.startswith("p_") else None
    await message.answer(
        "Hey! Tap below to open the showcase 👇",
        reply_markup=_open_kb(sp),
    )


@router.pre_checkout_query()
async def on_pre_checkout(q: PreCheckoutQuery, bot: Bot):
    await bot.answer_pre_checkout_query(q.id, ok=True)


@router.message(F.successful_payment)
async def on_successful_payment(message: Message):
    sp = message.successful_payment
    if not sp:
        return
    try:
        payment_id_str = sp.invoice_payload.split(":", 1)[0]
        payment_uuid = uuid.UUID(payment_id_str)
    except Exception:
        log.warning("bad payload: %r", sp.invoice_payload)
        return

    async with SessionLocal() as db:
        from sqlalchemy import select
        res = await db.execute(select(Payment).where(Payment.id == payment_uuid))
        p = res.scalar_one_or_none()
        if not p:
            return
        p.status = "paid"
        p.telegram_payment_charge_id = sp.telegram_payment_charge_id
        await db.commit()

        redis = get_redis()
        await publish(
            redis,
            channel_payment(p.user_id),
            {"type": "payment_completed", "payment_id": str(p.id), "amount": p.amount_stars},
        )

    from app.tasks.celery_app import celery_app
    celery_app.send_task("tasks.refund_payment", args=[str(payment_uuid)], countdown=60)
    log.info("payment %s scheduled for auto-refund in 60s", payment_uuid)


def build_dispatcher() -> Dispatcher:
    dp = Dispatcher()
    dp.include_router(router)
    return dp


async def setup_menu_button(bot: Bot):
    await bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(text="Showcase", web_app=WebAppInfo(url=settings.MINI_APP_URL))
    )
