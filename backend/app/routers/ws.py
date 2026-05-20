import asyncio
import json
from collections import defaultdict

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from redis import asyncio as aioredis

from app.auth import decode_jwt
from app.config import get_settings
from app.deps import get_redis
from app.services.presence import decrement, increment
from app.services.redis_pubsub import (
    CHANNEL_PRESENCE,
    channel_cloud_sync,
    channel_haptic,
    channel_payment,
    publish,
)

router = APIRouter()
_settings = get_settings()

# user_id -> set[WebSocket]
active: dict[int, set[WebSocket]] = defaultdict(set)


async def _pump_channel(ws: WebSocket, pubsub: aioredis.client.PubSub):
    async for msg in pubsub.listen():
        if msg["type"] != "message":
            continue
        try:
            await ws.send_text(msg["data"] if isinstance(msg["data"], str) else msg["data"].decode())
        except Exception:
            break


@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket, token: str = Query(...)):
    try:
        payload = decode_jwt(token)
        user_id = int(payload["sub"])
    except Exception:
        await ws.close(code=4401)
        return

    await ws.accept()
    redis = get_redis()
    await increment(redis)
    active[user_id].add(ws)

    pubsub = redis.pubsub()
    await pubsub.subscribe(
        CHANNEL_PRESENCE,
        channel_cloud_sync(user_id),
        channel_payment(user_id),
        channel_haptic(user_id),
    )

    pump_task = asyncio.create_task(_pump_channel(ws, pubsub))

    try:
        while True:
            text = await ws.receive_text()
            try:
                msg = json.loads(text)
            except Exception:
                continue
            mtype = msg.get("type")
            if mtype == "ping":
                await ws.send_text(json.dumps({"type": "pong"}))
            elif mtype == "identify":
                await ws.send_text(json.dumps({"type": "identified", "device_id": msg.get("device_id")}))
            elif mtype == "haptic_emit":
                await publish(
                    redis,
                    channel_haptic(user_id),
                    {
                        "type": "haptic_echo",
                        "style": msg.get("style", "medium"),
                        "from_device": msg.get("device_id", "unknown"),
                    },
                )
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        pump_task.cancel()
        try:
            await pubsub.unsubscribe()
            await pubsub.close()
        except Exception:
            pass
        active[user_id].discard(ws)
        await decrement(redis)
