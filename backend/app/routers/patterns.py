import uuid

from aiogram import Bot
from aiogram.types import (
    InlineQueryResultArticle,
    InputTextMessageContent,
)
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.config import get_settings
from app.deps import CurrentUser, DbDep
from app.models import HapticPattern
from app.schemas.api import HapticPatternBody, HapticPatternOut

router = APIRouter(prefix="/api/haptic-patterns", tags=["patterns"])
_settings = get_settings()


@router.post("", response_model=HapticPatternOut)
async def create_pattern(body: HapticPatternBody, user: CurrentUser, db: DbDep):
    pid = uuid.uuid4()
    share_message_id: str | None = None

    if _settings.BOT_TOKEN and not _settings.BOT_TOKEN.startswith("0:"):
        try:
            bot = Bot(token=_settings.BOT_TOKEN)
            result = await bot.save_prepared_inline_message(
                user_id=user.tg_id,
                result=InlineQueryResultArticle(
                    id=str(pid),
                    title="Haptic pattern",
                    description="Tap to feel my rhythm",
                    input_message_content=InputTextMessageContent(
                        message_text=f"🎵 Try my haptic pattern:\nhttps://t.me/{_settings.BOT_USERNAME}?startapp=p_{pid}",
                    ),
                ),
                allow_user_chats=True,
                allow_bot_chats=True,
                allow_group_chats=True,
                allow_channel_chats=True,
            )
            share_message_id = result.id
            await bot.session.close()
        except Exception:
            share_message_id = None

    p = HapticPattern(id=pid, user_id=user.id, steps=body.steps, share_message_id=share_message_id)
    db.add(p)
    await db.commit()
    await db.refresh(p)
    return HapticPatternOut(id=str(p.id), share_message_id=p.share_message_id, steps=p.steps)


@router.get("/{pattern_id}", response_model=HapticPatternOut)
async def get_pattern(pattern_id: str, db: DbDep):
    res = await db.execute(select(HapticPattern).where(HapticPattern.id == uuid.UUID(pattern_id)))
    p = res.scalar_one_or_none()
    if not p:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "pattern not found")
    return HapticPatternOut(id=str(p.id), share_message_id=p.share_message_id, steps=p.steps)
