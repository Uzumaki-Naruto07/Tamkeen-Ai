"""
Cache utilities for TamkeenAI API.
"""

import functools
from datetime import datetime, timedelta
import logging

# Create a simple in-memory cache
_cache = {}
logger = logging.getLogger(__name__)


def cache_result(ttl_seconds=3600):
    """
    Decorator to cache function results.
    
    Args:
        ttl_seconds: Time to live in seconds (default: 1 hour)
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Create a cache key from function name and arguments
            key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # Check if result is in cache and not expired
            if key in _cache:
                result, timestamp = _cache[key]
                if datetime.now() < timestamp + timedelta(seconds=ttl_seconds):
                    logger.debug(f"Cache hit for {key}")
                    return result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            _cache[key] = (result, datetime.now())
            logger.debug(f"Cache miss for {key}, storing result")
            return result
        return wrapper
    return decorator


def clear_cache():
    """Clear the entire cache."""
    global _cache
    _cache = {}
    logger.debug("Cache cleared")


def get_cache_size():
    """Get the number of items in the cache."""
    return len(_cache)


def remove_from_cache(key_prefix):
    """
    Remove items from cache that start with the given prefix.
    
    Args:
        key_prefix: Prefix to match against cache keys
    """
    global _cache
    keys_to_remove = [k for k in _cache.keys() if k.startswith(key_prefix)]
    for key in keys_to_remove:
        del _cache[key]
    logger.debug(f"Removed {len(keys_to_remove)} items from cache with prefix {key_prefix}")
 