from fastapi import APIRouter, Header, HTTPException, status
from sqlalchemy import select

from app.auth import (
    create_jwt,
    detect_launch_mode,
    parse_dev_init_data,
    verify_init_data,
)
from app.config import get_settings
from app.deps import CurrentUser, DbDep
from app.models import User
from app.schemas.api import UserOut, VerifyResponse

router = APIRouter(prefix="/api", tags=["auth"])
_settings = get_settings()


async def _resolve_init_data(raw: str) -> dict:
    if _settings.ENV == "dev" and raw.startswith("__dev__:"):
        return parse_dev_init_data(raw)
    return verify_init_data(raw, _settings.BOT_TOKEN)


@router.post("/auth/verify", response_model=VerifyResponse)
async def verify(
    db: DbDep,
    x_init_data: str | None = Header(default=None, alias="X-Init-Data"),
):
    if not x_init_data:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "missing X-Init-Data header")
    try:
        data = await _resolve_init_data(x_init_data)
    except ValueError as e:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, f"invalid init data: {e}")

    tg_user = data["user"]
    tg_id = int(tg_user["id"])
    res = await db.execute(select(User).where(User.tg_id == tg_id))
    user = res.scalar_one_or_none()
    if not user:
        user = User(
            tg_id=tg_id,
            username=tg_user.get("username"),
            first_name=tg_user.get("first_name"),
            last_name=tg_user.get("last_name"),
            language_code=tg_user.get("language_code"),
            is_premium=tg_user.get("is_premium", False),
            photo_url=tg_user.get("photo_url"),
        )
        db.add(user)
        await db.flush()
    else:
        user.username = tg_user.get("username") or user.username
        user.first_name = tg_user.get("first_name") or user.first_name
        user.last_name = tg_user.get("last_name") or user.last_name
        user.is_premium = tg_user.get("is_premium", user.is_premium)
    await db.commit()
    await db.refresh(user)

    launch_mode = detect_launch_mode(data.get("start_param", ""))
    token = create_jwt(user.id, launch_mode=launch_mode)
    return VerifyResponse(
        token=token,
        expires_in=_settings.JWT_TTL_SECONDS,
        user=UserOut.model_validate(user, from_attributes=True),
        launch_mode=launch_mode,
    )


@router.post("/auth/refresh", response_model=VerifyResponse)
async def refresh(
    db: DbDep,
    x_init_data: str | None = Header(default=None, alias="X-Init-Data"),
):
    return await verify(db, x_init_data)  # type: ignore[arg-type]


@router.get("/me", response_model=UserOut)
async def me(user: CurrentUser):
    return UserOut.model_validate(user, from_attributes=True)
