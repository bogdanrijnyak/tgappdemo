import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db import Base, engine
from app.deps import get_redis
from app.routers import auth as auth_router
from app.routers import cloud as cloud_router
from app.routers import patterns as patterns_router
from app.routers import share as share_router
from app.routers import stars as stars_router
from app.routers import stubs as stubs_router
from app.routers import vault as vault_router
from app.routers import ws as ws_router
from app.services.presence import presence_broadcaster

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("app")
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    redis = get_redis()
    await redis.set("presence:count", 0)
    stop = asyncio.Event()
    task = asyncio.create_task(presence_broadcaster(redis, stop))
    log.info("startup complete (env=%s)", settings.ENV)
    try:
        yield
    finally:
        stop.set()
        task.cancel()
        try:
            await task
        except Exception:
            pass


app = FastAPI(title="API Showcase backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(cloud_router.router)
app.include_router(vault_router.router)
app.include_router(stars_router.router)
app.include_router(share_router.router)
app.include_router(patterns_router.router)
app.include_router(stubs_router.router)
app.include_router(ws_router.router)


@app.get("/health")
async def health():
    return {"ok": True, "env": settings.ENV}


from app.bot.webhook import router as bot_router
app.include_router(bot_router)
