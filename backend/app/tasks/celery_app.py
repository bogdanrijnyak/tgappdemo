from celery import Celery

from app.config import get_settings

_settings = get_settings()

celery_app = Celery(
    "tgappdemo",
    broker=_settings.CELERY_BROKER_URL,
    backend=_settings.CELERY_RESULT_BACKEND,
    include=["app.tasks.refund", "app.tasks.story_png"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_acks_late=True,
    worker_prefetch_multiplier=2,
    task_default_retry_delay=10,
)
