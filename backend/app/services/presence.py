import asyncio
import json
import random

from redis import asyncio as aioredis

from app.config import get_settings
from app.services.redis_pubsub import CHANNEL_PRESENCE

PRESENCE_KEY = "presence:count"


async def increment(redis: aioredis.Redis) -> int:
    return await redis.incr(PRESENCE_KEY)


async def decrement(redis: aioredis.Redis) -> int:
    val = await redis.decr(PRESENCE_KEY)
    if val < 0:
        await redis.set(PRESENCE_KEY, 0)
        return 0
    return val


async def presence_broadcaster(redis: aioredis.Redis, stop_event: asyncio.Event) -> None:
    settings = get_settings()
    while not stop_event.is_set():
        try:
            raw = await redis.get(PRESENCE_KEY)
            count = int(raw or 0)
            if settings.SHOW_FAKE_PRESENCE and count < 5:
                count += random.randint(8, 30)
            await redis.publish(CHANNEL_PRESENCE, json.dumps({"type": "presence", "online": count}))
        except Exception:
            pass
        try:
            await asyncio.wait_for(stop_event.wait(), timeout=2.0)
        except asyncio.TimeoutError:
            pass
