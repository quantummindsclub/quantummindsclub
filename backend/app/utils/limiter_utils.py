from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os

redis_uri = "redis://{username}:{password}@{host}:{port}".format(
    username="default",  
    password=os.environ.get('REDIS_PASSWORD', ''),
    host=os.environ.get('REDIS_HOST', 'localhost'),
    port=os.environ.get('REDIS_PORT', 6379)
)

if os.environ.get('REDIS_SSL', 'False').lower() == 'true':
    redis_uri = redis_uri.replace('redis://', 'rediss://')

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=redis_uri,
    default_limits=["200 per day", "50 per hour"]
)

def init_limiter(app):
    """Initialize the rate limiter with the Flask app"""
    try:
        limiter.init_app(app)
        app.logger.info("Rate limiter initialized with Upstash Redis storage")
    except Exception as e:
        app.logger.error(f"Failed to initialize rate limiter with Redis: {str(e)}")
        memory_limiter = Limiter(
            key_func=get_remote_address,
            storage_uri="memory://",
            default_limits=["200 per day", "50 per hour"]
        )
        memory_limiter.init_app(app)
        app.logger.warning("Rate limiter initialized with memory storage as fallback")
        return memory_limiter
    
    return limiter