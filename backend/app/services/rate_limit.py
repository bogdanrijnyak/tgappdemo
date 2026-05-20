import time

from fastapi import HTTPException, status
from redis import asyncio as aioredis


async def sliding_window_check(redis: aioredis.Redis, key: str, limit: int, window_seconds: int) -> None:
    now = int(time.time() * 1000)
    cutoff = now - window_seconds * 1000
    member = f"{now}-{int.from_bytes(__import__('os').urandom(4), 'big')}"
    pipe = redis.pipeline()
    pipe.zremrangebyscore(key, 0, cutoff)
    pipe.zadd(key, {member: now})
    pipe.zcard(key)
    pipe.expire(key, window_seconds + 5)
    _, _, count, _ = await pipe.execute()
    if count > limit:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, f"rate limit: {limit}/{window_seconds}s")
