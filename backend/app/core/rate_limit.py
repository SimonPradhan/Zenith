import os

from slowapi import Limiter
from slowapi.util import get_remote_address


def rate_limit_enabled() -> bool:
    return os.getenv("ENVIRONMENT", "development").lower() != "test"


limiter = Limiter(
    key_func=get_remote_address,
    enabled=rate_limit_enabled(),
)
