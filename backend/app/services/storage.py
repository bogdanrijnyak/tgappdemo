import io

import boto3
from botocore.config import Config

from app.config import get_settings


def s3_client():
    s = get_settings()
    return boto3.client(
        "s3",
        endpoint_url=s.S3_ENDPOINT,
        aws_access_key_id=s.S3_ACCESS_KEY,
        aws_secret_access_key=s.S3_SECRET_KEY,
        region_name=s.S3_REGION,
        config=Config(signature_version="s3v4"),
    )


def ensure_bucket(bucket: str) -> None:
    client = s3_client()
    try:
        client.head_bucket(Bucket=bucket)
    except Exception:
        try:
            client.create_bucket(Bucket=bucket)
        except Exception:
            pass


def upload_public_png(key: str, data: bytes) -> str:
    s = get_settings()
    ensure_bucket(s.S3_BUCKET)
    client = s3_client()
    client.put_object(
        Bucket=s.S3_BUCKET,
        Key=key,
        Body=io.BytesIO(data),
        ContentType="image/png",
        ACL="public-read",
    )
    return f"{s.S3_PUBLIC_BASE}/{s.S3_BUCKET}/{key}"
