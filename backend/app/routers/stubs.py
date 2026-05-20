import asyncio
import random
import time
from datetime import timedelta

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.deps import CurrentUser, DbDep, RedisDep
from app.models import ShowcaseProgress
from app.schemas.api import CustomMethodBody, ReactionBody
from app.services.rate_limit import sliding_window_check

router = APIRouter(prefix="/api", tags=["stubs"])


GIFT_PRESETS = [
    {
        "id": "cosmic",
        "title": "Cosmic Drift",
        "symbol": "✦",
        "edge": "#3a47ff",
        "base": "#0c0f33",
        "halo": "#7c9bff",
        "serial": "#001324",
        "supply": 25000,
        "tagline": "A starfield captured in resin glass.",
    },
    {
        "id": "ember",
        "title": "Ember Bloom",
        "symbol": "✸",
        "edge": "#ff5a3c",
        "base": "#321414",
        "halo": "#ffa07a",
        "serial": "#000882",
        "supply": 12000,
        "tagline": "Forged in low orbit, polished by solar wind.",
    },
    {
        "id": "bloom",
        "title": "Velvet Bloom",
        "symbol": "❋",
        "edge": "#7a3cff",
        "base": "#1a0e3a",
        "halo": "#c2a3ff",
        "serial": "#001892",
        "supply": 8000,
        "tagline": "Velvet petals, frozen mid-bloom.",
    },
]


@router.get("/gifts/catalog")
async def gifts_catalog():
    return {"presets": GIFT_PRESETS}


@router.get("/business/profile")
async def business_profile():
    return {
        "hours": [
            {"day": "Mon-Fri", "open": "09:00", "close": "18:00"},
            {"day": "Sat", "open": "10:00", "close": "16:00"},
            {"day": "Sun", "open": None, "close": None},
        ],
        "location": {"city": "Lisbon", "address": "Rua das Flores, 12", "lat": 38.711, "lng": -9.139},
        "quick_replies": [
            {"trigger": "/menu", "text": "Today's menu →"},
            {"trigger": "/book", "text": "Reservation? Tap below."},
        ],
        "greeting": "Hey 👋 we're brewing — be back in a sec.",
        "away": "We're off until 09:00. Drop a note, we'll reply first thing.",
        "intro": {"title": "API Showcase Café", "subtitle": "Specialty pour-over · roasted weekly"},
        "chat_link": "https://t.me/+demo_business_chat",
        "updated_at": int(time.time()) - random.randint(40, 600),
    }


@router.post("/reactions/send")
async def reactions_send(body: ReactionBody, user: CurrentUser, redis: RedisDep):
    key = f"reactions:{body.target_id}"
    field = body.emoji
    await redis.hincrby(key, field, 1)
    await redis.expire(key, 3600)
    totals = await redis.hgetall(key)
    return {"ok": True, "totals": {k: int(v) for k, v in totals.items()}, "paid": body.paid}


@router.post("/age-verify")
async def age_verify():
    await asyncio.sleep(1.5)
    return {"verified": True, "expires_at": (time.time() + 30 * 86400)}


CUSTOM_METHOD_WHITELIST = {
    "getInternalState": {"state": "ready", "items": 42, "version": "2.1.0"},
    "getRequestedContact": {"phone": "+380 50 555 04 12", "name": "Alex Carter"},
    "getCurrentTheme": {"mode": "light", "accent": "#2481cc", "platform": "ios"},
}


@router.post("/custom-method")
async def custom_method(body: CustomMethodBody, user: CurrentUser, redis: RedisDep):
    await sliding_window_check(redis, f"rl:custom:{user.id}", limit=30, window_seconds=60)
    await asyncio.sleep(0.3 + random.random() * 0.3)
    if body.method not in CUSTOM_METHOD_WHITELIST:
        return {"error": "METHOD_NOT_ALLOWED"}
    return CUSTOM_METHOD_WHITELIST[body.method]


@router.get("/progress")
async def progress_get(user: CurrentUser, db: DbDep):
    res = await db.execute(select(ShowcaseProgress).where(ShowcaseProgress.user_id == user.id))
    rows = res.scalars().all()
    return {"completed": [r.card_id for r in rows]}


@router.post("/progress")
async def progress_post(payload: dict, user: CurrentUser, db: DbDep):
    card_id = payload.get("card_id")
    if not card_id or not isinstance(card_id, str):
        raise HTTPException(400, "missing card_id")
    exists = await db.execute(
        select(ShowcaseProgress).where(
            ShowcaseProgress.user_id == user.id, ShowcaseProgress.card_id == card_id
        )
    )
    if exists.scalar_one_or_none() is None:
        db.add(ShowcaseProgress(user_id=user.id, card_id=card_id))
        await db.commit()
    return {"ok": True}
