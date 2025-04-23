import os
from redis import Redis

redis_client = Redis(
    host=os.environ.get('REDIS_HOST', 'localhost'),
    port=int(os.environ.get('REDIS_PORT', 6379)),
    password=os.environ.get('REDIS_PASSWORD', None),
    ssl=os.environ.get('REDIS_SSL', 'False').lower() == 'true'
)

def get_redis_client():
    return redis_client