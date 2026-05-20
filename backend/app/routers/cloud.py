import json
import re

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import delete, select

from app.deps import CurrentUser, DbDep, RedisDep
from app.models import CloudStorage
from app.schemas.api import CloudItem, CloudPutBody
from app.services.redis_pubsub import channel_cloud_sync, publish

router = APIRouter(prefix="/api/cloud", tags=["cloud"])

KEY_RE = re.compile(r"^[a-zA-Z0-9_]{1,64}$")
MAX_KEYS = 1024
MAX_VALUE = 4096


def _check_key(key: str) -> None:
    if not KEY_RE.match(key):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "invalid key format")


@router.get("", response_model=list[CloudItem])
async def list_keys(user: CurrentUser, db: DbDep):
    res = await db.execute(select(CloudStorage).where(CloudStorage.user_id == user.id))
    rows = res.scalars().all()
    return [CloudItem(key=r.key, value=r.value, updated_at=r.updated_at.isoformat()) for r in rows]


@router.get("/{key}", response_model=CloudItem)
async def get_one(key: str, user: CurrentUser, db: DbDep):
    _check_key(key)
    res = await db.execute(
        select(CloudStorage).where(CloudStorage.user_id == user.id, CloudStorage.key == key)
    )
    row = res.scalar_one_or_none()
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "key not found")
    return CloudItem(key=row.key, value=row.value, updated_at=row.updated_at.isoformat())


@router.put("/{key}", response_model=CloudItem)
async def put_one(key: str, body: CloudPutBody, user: CurrentUser, db: DbDep, redis: RedisDep):
    _check_key(key)
    if len(body.value.encode("utf-8")) > MAX_VALUE:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "value too large")

    res = await db.execute(
        select(CloudStorage).where(CloudStorage.user_id == user.id, CloudStorage.key == key)
    )
    row = res.scalar_one_or_none()
    if row is None:
        count_res = await db.execute(select(CloudStorage).where(CloudStorage.user_id == user.id))
        if len(count_res.scalars().all()) >= MAX_KEYS:
            raise HTTPException(status.HTTP_409_CONFLICT, "key_limit_exceeded")
        row = CloudStorage(user_id=user.id, key=key, value=body.value)
        db.add(row)
    else:
        row.value = body.value
    await db.commit()
    await db.refresh(row)
    await publish(
        redis,
        channel_cloud_sync(user.id),
        {"type": "cloud_storage_updated", "key": key, "action": "set"},
    )
    return CloudItem(key=row.key, value=row.value, updated_at=row.updated_at.isoformat())


@router.delete("/{key}")
async def delete_one(key: str, user: CurrentUser, db: DbDep, redis: RedisDep):
    _check_key(key)
    await db.execute(
        delete(CloudStorage).where(CloudStorage.user_id == user.id, CloudStorage.key == key)
    )
    await db.commit()
    await publish(
        redis,
        channel_cloud_sync(user.id),
        {"type": "cloud_storage_updated", "key": key, "action": "delete"},
    )
    return {"ok": True}
