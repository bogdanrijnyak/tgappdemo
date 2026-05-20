from fastapi import APIRouter, HTTPException, status
from sqlalchemy import delete, select

from app.deps import CurrentUser, DbDep, RedisDep
from app.models import VaultSecret
from app.schemas.api import VaultBody, VaultOut
from app.services.redis_pubsub import publish, channel_haptic
from app.services.vault_crypto import decrypt, encrypt

router = APIRouter(prefix="/api/vault", tags=["vault"])


@router.get("", response_model=VaultOut)
async def read(user: CurrentUser, db: DbDep):
    res = await db.execute(select(VaultSecret).where(VaultSecret.user_id == user.id))
    row = res.scalar_one_or_none()
    if not row:
        return VaultOut(secret_note=None)
    try:
        plaintext = decrypt(row.ciphertext)
    except Exception:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "decryption failed")
    return VaultOut(secret_note=plaintext)


@router.put("", response_model=VaultOut)
async def write(body: VaultBody, user: CurrentUser, db: DbDep):
    ct = encrypt(body.secret_note)
    res = await db.execute(select(VaultSecret).where(VaultSecret.user_id == user.id))
    row = res.scalar_one_or_none()
    if row is None:
        row = VaultSecret(user_id=user.id, ciphertext=ct)
        db.add(row)
    else:
        row.ciphertext = ct
    await db.commit()
    return VaultOut(secret_note=body.secret_note)


@router.delete("")
async def clear(user: CurrentUser, db: DbDep, redis: RedisDep):
    await db.execute(delete(VaultSecret).where(VaultSecret.user_id == user.id))
    await db.commit()
    await publish(redis, channel_haptic(user.id), {"type": "secure_storage_cleared"})
    return {"ok": True}
