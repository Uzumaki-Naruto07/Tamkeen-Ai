"""
Cache Utility Module

This module provides caching functionality to improve application performance.
"""

import os
import json
import logging
import functools
import hashlib
from typing import Dict, List, Any, Optional, Tuple, Union, Callable
from datetime import datetime, timedelta

# Import settings
from backend.config.settings import CACHE_TYPE, CACHE_DEFAULT_TIMEOUT, REDIS_URL

# Setup logger
logger = logging.getLogger(__name__)

# Try to import optional dependencies
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("Redis not installed. Install with: pip install redis")

try:
    import pymemcache
    MEMCACHED_AVAILABLE = True
except ImportError:
    MEMCACHED_AVAILABLE = False
    logger.warning("pymemcache not installed. Install with: pip install pymemcache")


# Cache interface
class CacheInterface:
    """Base cache interface"""
    
    def get(self, key: str) -> Any:
        """Get value from cache"""
        raise NotImplementedError
    
    def set(self, key: str, value: Any, ttl: int = None) -> bool:
        """Set value in cache"""
        raise NotImplementedError
    
    def delete(self, key: str) -> bool:
        """Delete value from cache"""
        raise NotImplementedError
    
    def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        raise NotImplementedError
    
    def clear(self) -> bool:
        """Clear cache"""
        raise NotImplementedError


# Simple in-memory cache
class SimpleCache(CacheInterface):
    """Simple in-memory cache"""
    
    def __init__(self):
        """Initialize cache"""
        self.cache = {}
        self.expirations = {}
    
    def get(self, key: str) -> Any:
        """
        Get value from cache
        
        Args:
            key: Cache key
            
        Returns:
            Any: Cached value or None
        """
        # Check if key exists and not expired
        if key in self.cache:
            # Check expiration
            if key in self.expirations:
                expiration = self.expirations[key]
                if expiration and expiration < datetime.now():
                    # Expired
                    self.delete(key)
                    return None
            
            return self.cache[key]
        
        return None
    
    def set(self, key: str, value: Any, ttl: int = None) -> bool:
        """
        Set value in cache
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds
            
        Returns:
            bool: Success status
        """
        self.cache[key] = value
        
        # Set expiration
        if ttl:
            self.expirations[key] = datetime.now() + timedelta(seconds=ttl)
        elif ttl == 0:
            # No expiration
            self.expirations.pop(key, None)
        else:
            # Default expiration
            self.expirations[key] = datetime.now() + timedelta(seconds=CACHE_DEFAULT_TIMEOUT)
        
        return True
    
    def delete(self, key: str) -> bool:
        """
        Delete value from cache
        
        Args:
            key: Cache key
            
        Returns:
            bool: Success status
        """
        if key in self.cache:
            del self.cache[key]
            self.expirations.pop(key, None)
            return True
        
        return False
    
    def exists(self, key: str) -> bool:
        """
        Check if key exists in cache
        
        Args:
            key: Cache key
            
        Returns:
            bool: Key exists
        """
        # Check if key exists and not expired
        if key in self.cache:
            # Check expiration
            if key in self.expirations:
                expiration = self.expirations[key]
                if expiration and expiration < datetime.now():
                    # Expired
                    self.delete(key)
                    return False
            
            return True
        
        return False
    
    def clear(self) -> bool:
        """
        Clear cache
        
        Returns:
            bool: Success status
        """
        self.cache.clear()
        self.expirations.clear()
        return True


# Redis cache
class RedisCache(CacheInterface):
    """Redis cache"""
    
    def __init__(self, redis_url: str = REDIS_URL):
        """
        Initialize Redis cache
        
        Args:
            redis_url: Redis URL
        """
        if not REDIS_AVAILABLE:
            raise ImportError("Redis not available. Install with: pip install redis")
        
        self.redis = redis.from_url(redis_url)
    
    def get(self, key: str) -> Any:
        """
        Get value from cache
        
        Args:
            key: Cache key
            
        Returns:
            Any: Cached value or None
        """
        value = self.redis.get(key)
        
        if value:
            try:
                return json.loads(value)
            except:
                return value.decode('utf-8')
        
        return None
    
    def set(self, key: str, value: Any, ttl: int = None) -> bool:
        """
        Set value in cache
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds
            
        Returns:
            bool: Success status
        """
        # Serialize value
        if isinstance(value, (dict, list, tuple, bool, int, float)) or value is None:
            value = json.dumps(value)
        
        # Set with expiration
        if ttl:
            return self.redis.setex(key, ttl, value)
        else:
            return self.redis.set(key, value)
    
    def delete(self, key: str) -> bool:
        """
        Delete value from cache
        
        Args:
            key: Cache key
            
        Returns:
            bool: Success status
        """
        return self.redis.delete(key) > 0
    
    def exists(self, key: str) -> bool:
        """
        Check if key exists in cache
        
        Args:
            key: Cache key
            
        Returns:
            bool: Key exists
        """
        return self.redis.exists(key) > 0
    
    def clear(self) -> bool:
        """
        Clear cache
        
        Returns:
            bool: Success status
        """
        return self.redis.flushdb()


# Get cache instance based on configuration
def get_cache() -> CacheInterface:
    """
    Get cache instance
    
    Returns:
        CacheInterface: Cache instance
    """
    cache_type = CACHE_TYPE.lower()
    
    if cache_type == 'redis' and REDIS_AVAILABLE:
        try:
            return RedisCache()
        except Exception as e:
            logger.error(f"Failed to initialize Redis cache: {str(e)}")
            return SimpleCache()
    
    # Default to simple cache
    return SimpleCache()


# Cache instance
_cache = None


def get_cache_instance() -> CacheInterface:
    """
    Get cache instance singleton
    
    Returns:
        CacheInterface: Cache instance
    """
    global _cache
    
    if _cache is None:
        _cache = get_cache()
    
    return _cache


# Cache decorator
def cache_result(prefix: str = "", ttl: int = None):
    """
    Cache function result decorator
    
    Args:
        prefix: Cache key prefix
        ttl: Time to live in seconds
        
    Returns:
        Callable: Decorated function
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            key_parts = [prefix, func.__name__]
            
            # Add args to key
            for arg in args:
                if isinstance(arg, (str, int, float, bool)) or arg is None:
                    key_parts.append(str(arg))
            
            # Add kwargs to key (sorted for consistency)
            for key in sorted(kwargs.keys()):
                value = kwargs[key]
                if isinstance(value, (str, int, float, bool)) or value is None:
                    key_parts.append(f"{key}:{value}")
            
            # Generate key
            cache_key = hashlib.md5(":".join(key_parts).encode()).hexdigest()
            
            # Get cache
            cache = get_cache_instance()
            
            # Check cache
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Call function
            result = func(*args, **kwargs)
            
            # Cache result
            cache.set(cache_key, result, ttl)
            
            return result
        
        return wrapper
    
    return decorator


# Convenience functions

def cache_get(key: str) -> Any:
    """Get value from cache"""
    cache = get_cache_instance()
    return cache.get(key)


def cache_set(key: str, value: Any, ttl: int = None) -> bool:
    """Set value in cache"""
    cache = get_cache_instance()
    return cache.set(key, value, ttl)


def cache_delete(key: str) -> bool:
    """Delete value from cache"""
    cache = get_cache_instance()
    return cache.delete(key)


def cache_exists(key: str) -> bool:
    """Check if key exists in cache"""
    cache = get_cache_instance()
    return cache.exists(key)


def cache_clear() -> bool:
    """Clear cache"""
    cache = get_cache_instance()
    return cache.clear() 