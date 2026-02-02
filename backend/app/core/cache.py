"""In-memory TTL cache.

Simple dict-based cache with per-key TTL expiration.
No external dependencies (Redis not required).
"""

import time
from typing import Any


class TTLCache:
    def __init__(self):
        self._store: dict[str, tuple[float, Any]] = {}

    def get(self, key: str) -> Any | None:
        entry = self._store.get(key)
        if entry and time.monotonic() < entry[0]:
            return entry[1]
        self._store.pop(key, None)
        return None

    def set(self, key: str, value: Any, ttl: int):
        self._store[key] = (time.monotonic() + ttl, value)


cache = TTLCache()
