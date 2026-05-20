import uuid

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.deps import CurrentUser, DbDep
from app.models import StoryTask
from app.schemas.api import StoryRequest, StoryStatus

router = APIRouter(prefix="/api/share", tags=["share"])


@router.post("/story", response_model=StoryStatus)
async def request_story(body: StoryRequest, user: CurrentUser, db: DbDep):
    task = StoryTask(
        id=uuid.uuid4(),
        user_id=user.id,
        template=body.template,
        preset=body.preset,
        status="pending",
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)

    from app.tasks.celery_app import celery_app
    celery_app.send_task(
        "tasks.generate_story_png",
        args=[str(task.id), user.id, body.template, body.preset, body.user_name or (user.first_name or "Demo")],
    )
    return StoryStatus(task_id=str(task.id), status=task.status, url=task.url)


@router.get("/story/{task_id}", response_model=StoryStatus)
async def get_story(task_id: str, user: CurrentUser, db: DbDep):
    res = await db.execute(select(StoryTask).where(StoryTask.id == uuid.UUID(task_id)))
    t = res.scalar_one_or_none()
    if not t or t.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "task not found")
    return StoryStatus(task_id=str(t.id), status=t.status, url=t.url)


@router.post("/download", response_model=StoryStatus)
async def request_download(body: StoryRequest, user: CurrentUser, db: DbDep):
    task = StoryTask(
        id=uuid.uuid4(),
        user_id=user.id,
        template="wallpaper",
        preset=body.preset,
        status="pending",
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    from app.tasks.celery_app import celery_app
    celery_app.send_task(
        "tasks.generate_wallpaper_png",
        args=[str(task.id), user.id, body.preset, body.user_name or (user.first_name or "Demo")],
    )
    return StoryStatus(task_id=str(task.id), status=task.status, url=task.url)
