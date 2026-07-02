import redis
import json
from app.core.config import settings

redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    decode_responses=True,
    socket_connect_timeout=2,
    socket_timeout=2
)

def get_redis_client():
    return redis_client

def cache_result(key: str, value: dict, ttl: int = 300):
    try:
        redis_client.setex(key, ttl, json.dumps(value, ensure_ascii=False))
        return True
    except Exception as e:
        print(f"Redis cache error: {e}")
        return False

def get_cached_result(key: str):
    try:
        data = redis_client.get(key)
        if data:
            return json.loads(data)
        return None
    except Exception as e:
        print(f"Redis get error: {e}")
        return None
