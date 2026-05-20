import asyncio
import io
import logging
import math
import uuid

from PIL import Image, ImageDraw, ImageFilter, ImageFont
from sqlalchemy import select

from app.db import SessionLocal
from app.models import StoryTask
from app.routers.stubs import GIFT_PRESETS
from app.services.storage import upload_public_png
from app.tasks.celery_app import celery_app

log = logging.getLogger("story_png")


def _preset(preset_id: str) -> dict:
    for p in GIFT_PRESETS:
        if p["id"] == preset_id:
            return p
    return GIFT_PRESETS[0]


def _try_font(size: int) -> ImageFont.FreeTypeFont:
    for path in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ):
        try:
            return ImageFont.truetype(path, size=size)
        except Exception:
            continue
    return ImageFont.load_default()


def _hex(c: str) -> tuple[int, int, int]:
    c = c.lstrip("#")
    return tuple(int(c[i:i+2], 16) for i in (0, 2, 4))


def _radial(width: int, height: int, inner: str, outer: str) -> Image.Image:
    img = Image.new("RGB", (width, height), _hex(outer))
    cx, cy = width / 2, height / 2.5
    max_r = math.hypot(cx, cy)
    inner_rgb = _hex(inner)
    outer_rgb = _hex(outer)
    px = img.load()
    for y in range(height):
        for x in range(width):
            d = math.hypot(x - cx, y - cy) / max_r
            d = max(0.0, min(1.0, d))
            r = int(inner_rgb[0] * (1 - d) + outer_rgb[0] * d)
            g = int(inner_rgb[1] * (1 - d) + outer_rgb[1] * d)
            b = int(inner_rgb[2] * (1 - d) + outer_rgb[2] * d)
            px[x, y] = (r, g, b)
    return img.filter(ImageFilter.GaussianBlur(radius=12))


def _render(width: int, height: int, preset: dict, user_name: str, serial: str | None = None) -> bytes:
    img = _radial(width, height, preset["edge"], preset["base"])
    draw = ImageDraw.Draw(img, "RGBA")

    symbol_font = _try_font(int(width * 0.42))
    draw.text(
        (width / 2, height / 2 - height * 0.04),
        preset["symbol"],
        font=symbol_font,
        fill=(255, 255, 255, 255),
        anchor="mm",
    )

    title_font = _try_font(int(width * 0.07))
    draw.text(
        (width / 2, height * 0.78),
        preset["title"],
        font=title_font,
        fill=(255, 255, 255, 240),
        anchor="mm",
    )

    name_font = _try_font(int(width * 0.045))
    draw.text(
        (width / 2, height * 0.84),
        user_name,
        font=name_font,
        fill=(255, 255, 255, 200),
        anchor="mm",
    )

    serial_text = serial or preset["serial"]
    serial_font = _try_font(int(width * 0.035))
    draw.text(
        (width / 2, height * 0.88),
        serial_text,
        font=serial_font,
        fill=(255, 255, 255, 160),
        anchor="mm",
    )

    foot_font = _try_font(int(width * 0.032))
    draw.text(
        (width / 2, height - height * 0.05),
        "via @APIShowcaseBot",
        font=foot_font,
        fill=(255, 255, 255, 170),
        anchor="mm",
    )

    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


async def _update_task(task_id: str, status: str, url: str | None = None) -> None:
    async with SessionLocal() as db:
        res = await db.execute(select(StoryTask).where(StoryTask.id == uuid.UUID(task_id)))
        t = res.scalar_one_or_none()
        if not t:
            return
        t.status = status
        if url:
            t.url = url
        await db.commit()


@celery_app.task(name="tasks.generate_story_png", bind=True, max_retries=2)
def generate_story_png(self, task_id: str, user_id: int, template: str, preset_id: str, user_name: str):
    try:
        preset = _preset(preset_id)
        data = _render(1080, 1920, preset, user_name)
        key = f"stories/{user_id}/{task_id}.png"
        url = upload_public_png(key, data)
        asyncio.run(_update_task(task_id, "done", url))
    except Exception as exc:
        log.exception("story png failed: %s", exc)
        asyncio.run(_update_task(task_id, "failed"))
        raise self.retry(exc=exc, countdown=10)


@celery_app.task(name="tasks.generate_wallpaper_png", bind=True, max_retries=2)
def generate_wallpaper_png(self, task_id: str, user_id: int, preset_id: str, user_name: str):
    try:
        preset = _preset(preset_id)
        data = _render(1170, 2532, preset, user_name)
        key = f"wallpapers/{user_id}/{task_id}.png"
        url = upload_public_png(key, data)
        asyncio.run(_update_task(task_id, "done", url))
    except Exception as exc:
        log.exception("wallpaper png failed: %s", exc)
        asyncio.run(_update_task(task_id, "failed"))
        raise self.retry(exc=exc, countdown=10)
