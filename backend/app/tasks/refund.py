import asyncio
import logging
import uuid

import httpx
from sqlalchemy import select

from app.config import get_settings
from app.db import SessionLocal
from app.models import Payment
from app.tasks.celery_app import celery_app

log = logging.getLogger("refund")


async def _do_refund(payment_id: str) -> None:
    settings = get_settings()
    pid = uuid.UUID(payment_id)
    async with SessionLocal() as db:
        res = await db.execute(select(Payment).where(Payment.id == pid))
        p = res.scalar_one_or_none()
        if not p or p.status != "paid" or p.refunded_at or not p.telegram_payment_charge_id:
            log.info("refund skip %s status=%s", payment_id, getattr(p, "status", None))
            return
        async with httpx.AsyncClient(timeout=15.0) as client:
            for attempt in range(3):
                try:
                    resp = await client.post(
                        f"https://api.telegram.org/bot{settings.BOT_TOKEN}/refundStarPayment",
                        json={
                            "user_id": p.user_id,
                            "telegram_payment_charge_id": p.telegram_payment_charge_id,
                        },
                    )
                    data = resp.json()
                    if data.get("ok"):
                        break
                    log.warning("refund attempt %d failed: %s", attempt + 1, data)
                except Exception as e:
                    log.warning("refund http err: %s", e)
                await asyncio.sleep(2 ** attempt)
        from datetime import datetime, timezone
        p.status = "refunded"
        p.refunded_at = datetime.now(timezone.utc)
        await db.commit()
        log.info("refunded %s", payment_id)


@celery_app.task(name="tasks.refund_payment", bind=True, max_retries=3)
def refund_payment(self, payment_id: str):
    try:
        asyncio.run(_do_refund(payment_id))
    except Exception as exc:
        raise self.retry(exc=exc, countdown=30)
