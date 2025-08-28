import redis
import json
import os
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

try:
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    # Test connection
    redis_client.ping()
except (redis.ConnectionError, redis.exceptions.ConnectionError, Exception):
    print("Warning: Redis connection failed. Caching will be disabled.")
    redis_client = None

def get_user_balance_from_cache(user_id: int):
    """Get user balance from Redis cache"""
    if not redis_client:
        return None
    try:
        balance = redis_client.get(f"user_balance:{user_id}")
        return int(balance) if balance else None
    except Exception as e:
        print(f"Redis get error: {e}")
        return None

def set_user_balance_in_cache(user_id: int, balance: int, expire_seconds: int = 300):
    """Set user balance in Redis cache with expiration"""
    if not redis_client:
        return False
    try:
        redis_client.setex(f"user_balance:{user_id}", expire_seconds, balance)
        return True
    except Exception as e:
        print(f"Redis set error: {e}")
        return False

def invalidate_user_balance_cache(user_id: int):
    """Remove user balance from cache"""
    if not redis_client:
        return False
    try:
        redis_client.delete(f"user_balance:{user_id}")
        return True
    except Exception as e:
        print(f"Redis delete error: {e}")
        return False
