from cryptography.fernet import Fernet

from app.config import get_settings


def _cipher() -> Fernet:
    return Fernet(get_settings().VAULT_FERNET_KEY.encode())


def encrypt(plaintext: str) -> bytes:
    return _cipher().encrypt(plaintext.encode("utf-8"))


def decrypt(ciphertext: bytes) -> str:
    return _cipher().decrypt(ciphertext).decode("utf-8")
