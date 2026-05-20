from typing import Any, Literal
from pydantic import BaseModel, Field


class VerifyRequest(BaseModel):
    init_data: str | None = None


class UserOut(BaseModel):
    id: int
    tg_id: int
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    language_code: str | None = None
    is_premium: bool = False
    photo_url: str | None = None


class VerifyResponse(BaseModel):
    token: str
    expires_in: int
    user: UserOut
    launch_mode: str


class CloudPutBody(BaseModel):
    value: str = Field(..., max_length=4096)


class CloudItem(BaseModel):
    key: str
    value: str
    updated_at: str


class VaultBody(BaseModel):
    secret_note: str = Field(..., max_length=512)


class VaultOut(BaseModel):
    secret_note: str | None = None


class InvoiceCreate(BaseModel):
    purpose: Literal["demo_heart"] = "demo_heart"
    amount_stars: int = Field(default=1, ge=1, le=10)


class InvoiceOut(BaseModel):
    payment_id: str
    invoice_url: str


class StoryRequest(BaseModel):
    template: str = "collectible"
    preset: str = "bloom"
    user_name: str | None = None


class StoryStatus(BaseModel):
    task_id: str
    status: Literal["pending", "done", "failed"]
    url: str | None = None


class HapticPatternBody(BaseModel):
    steps: list[Any] = Field(default_factory=list)


class HapticPatternOut(BaseModel):
    id: str
    share_message_id: str | None = None
    steps: list[Any] = Field(default_factory=list)


class CustomMethodBody(BaseModel):
    method: str
    params: dict | None = None


class ReactionBody(BaseModel):
    target_id: str
    emoji: str
    paid: bool = False
