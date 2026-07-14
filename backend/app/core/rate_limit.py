"""Lightweight in-memory rate limiting for unauthenticated auth endpoints
(login/register/forgot-password/reset-password) — these are the endpoints a
credential-stuffing or account-enumeration script would hammer before a
session even exists, so they can't rely on any per-user throttling.

Single-process, in-memory sliding window. Good enough for the current
single-instance deployment; if the app is ever horizontally scaled this
needs to move to a shared store (e.g. Redis) to stay effective.
"""

import time
from collections import defaultdict

from fastapi import HTTPException, Request, status

_buckets: dict[str, list[float]] = defaultdict(list)


def reset_rate_limits() -> None:
    """Test-only hook — clears all buckets between test cases so unrelated
    tests don't accumulate hits against the same client key."""
    _buckets.clear()


def rate_limit(max_requests: int, window_seconds: float = 60.0):
    async def dependency(request: Request) -> None:
        client_host = request.client.host if request.client else "unknown"
        key = f"{request.url.path}:{client_host}"
        now = time.monotonic()
        bucket = _buckets[key]
        cutoff = now - window_seconds
        while bucket and bucket[0] < cutoff:
            bucket.pop(0)
        if len(bucket) >= max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
            )
        bucket.append(now)

    return dependency
