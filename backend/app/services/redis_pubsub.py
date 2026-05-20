import json

from redis import asyncio as aioredis


async def publish(redis: aioredis.Redis, channel: str, payload: dict) -> None:
    await redis.publish(channel, json.dumps(payload))


def channel_cloud_sync(user_id: int) -> str:
    return f"cloud_sync:{user_id}"


def channel_payment(user_id: int) -> str:
    return f"payment_push:{user_id}"


def channel_haptic(user_id: int) -> str:
    return f"haptic_echo:{user_id}"


CHANNEL_PRESENCE = "presence:global"
