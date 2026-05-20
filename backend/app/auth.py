import hmac
import hashlib
import json
import time
import uuid
from urllib.parse import parse_qsl

import jwt

from app.config import get_settings

_settings = get_settings()


def verify_init_data(init_data: str, bot_token: str, max_age: int = 86400) -> dict:
    """Validate Telegram WebApp initData per official spec (HMAC-SHA256)."""
    parsed = dict(parse_qsl(init_data, strict_parsing=True))
    received = parsed.pop("hash", None)
    if not received:
        raise ValueError("missing hash")
    data_check = "\n".join(f"{k}={v}" for k, v in sorted(parsed.items()))
    secret = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    calc = hmac.new(secret, data_check.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(calc, received):
        raise ValueError("invalid signature")
    if int(time.time()) - int(parsed.get("auth_date", 0)) > max_age:
        raise ValueError("expired")
    return {**parsed, "user": json.loads(parsed["user"])}


def parse_dev_init_data(init_data: str) -> dict:
    """Dev backdoor: `__dev__:<user_id>:<name>`."""
    if not init_data.startswith("__dev__:"):
        raise ValueError("not dev init data")
    parts = init_data.split(":", 2)
    user_id = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 802441099
    name = parts[2] if len(parts) > 2 else "Demo User"
    return {
        "user": {"id": user_id, "first_name": name, "username": name.lower().replace(" ", "_")},
        "auth_date": str(int(time.time())),
        "start_param": "",
    }


def detect_launch_mode(start_param: str) -> str:
    sp = (start_param or "").lower()
    if sp.startswith("attach"):
        return "attach"
    if sp.startswith("side"):
        return "side"
    if sp.startswith("menu"):
        return "menu"
    if sp.startswith("btn"):
        return "inline-btn"
    if sp.startswith("inline"):
        return "inline-mode"
    if sp.startswith("p_"):
        return "direct"
    return "mini-app"


def create_jwt(user_id: int, launch_mode: str = "mini-app", platform: str = "web") -> str:
    payload = {
        "sub": str(user_id),
        "jti": str(uuid.uuid4()),
        "iat": int(time.time()),
        "exp": int(time.time()) + _settings.JWT_TTL_SECONDS,
        "platform": platform,
        "launch_mode": launch_mode,
    }
    return jwt.encode(payload, _settings.JWT_SECRET, algorithm=_settings.JWT_ALG)


def decode_jwt(token: str) -> dict:
    return jwt.decode(token, _settings.JWT_SECRET, algorithms=[_settings.JWT_ALG])
