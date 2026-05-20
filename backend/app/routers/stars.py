import uuid

import httpx
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.config import get_settings
from app.deps import CurrentUser, DbDep, RedisDep
from app.models import Payment
from app.schemas.api import InvoiceCreate, InvoiceOut
from app.services.rate_limit import sliding_window_check

router = APIRouter(prefix="/api/stars", tags=["stars"])
_settings = get_settings()


@router.post("/invoice", response_model=InvoiceOut)
async def create_invoice(body: InvoiceCreate, user: CurrentUser, db: DbDep, redis: RedisDep):
    await sliding_window_check(redis, f"rl:invoice:{user.id}", limit=5, window_seconds=60)

    payment_id = str(uuid.uuid4())
    payload = f"{payment_id}:{user.id}:{body.purpose}"

    bot_token = _settings.BOT_TOKEN
    invoice_url = ""
    if bot_token and not bot_token.startswith("0:"):
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"https://api.telegram.org/bot{bot_token}/createInvoiceLink",
                json={
                    "title": "API Showcase demo heart",
                    "description": "Tap heart to send Stars (auto-refund in 60s)",
                    "payload": payload,
                    "currency": "XTR",
                    "prices": [{"label": "Heart", "amount": body.amount_stars}],
                },
            )
            data = resp.json()
            if not data.get("ok"):
                raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"bot api: {data}")
            invoice_url = data["result"]
    else:
        invoice_url = f"https://t.me/$dev_{payment_id}"

    p = Payment(
        id=uuid.UUID(payment_id),
        user_id=user.id,
        purpose=body.purpose,
        amount_stars=body.amount_stars,
        status="pending",
    )
    db.add(p)
    await db.commit()

    return InvoiceOut(payment_id=payment_id, invoice_url=invoice_url)


@router.post("/refund/{payment_id}")
async def refund(payment_id: str, user: CurrentUser, db: DbDep):
    res = await db.execute(select(Payment).where(Payment.id == uuid.UUID(payment_id)))
    p = res.scalar_one_or_none()
    if not p:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "payment not found")
    if p.user_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "not yours")
    from app.tasks.celery_app import celery_app
    celery_app.send_task("tasks.refund_payment", args=[str(p.id)])
    return {"ok": True, "scheduled": True}


@router.get("/{payment_id}")
async def status_of(payment_id: str, user: CurrentUser, db: DbDep):
    res = await db.execute(select(Payment).where(Payment.id == uuid.UUID(payment_id)))
    p = res.scalar_one_or_none()
    if not p or p.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "payment not found")
    return {
        "payment_id": str(p.id),
        "status": p.status,
        "amount_stars": p.amount_stars,
        "refunded_at": p.refunded_at.isoformat() if p.refunded_at else None,
    }
