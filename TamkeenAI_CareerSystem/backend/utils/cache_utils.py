"""
Cache Utilities Module

This module provides caching functionality to improve performance by storing
frequently accessed or computationally expensive results.
"""

import os
import json
import logging
import hashlib
import functools
from typing import Dict, List, Any, Optional, Tuple, Union, Callable
from datetime import datetime, timedelta

# Import utilities
from backend.utils.date_utils import now
from backend.database.models import Cache

# Setup logger
logger = logging.getLogger(__name__)


def generate_cache_key(prefix: str, *args, **kwargs) -> str:
    """
    Generate a cache key from function arguments
    
    Args:
        prefix: Key prefix
        args: Function args
        kwargs: Function kwargs
        
    Returns:
        str: Cache key
    """
    # Convert args and kwargs to a string representation
    args_str = str(args) if args else ""
    kwargs_str = str(sorted(kwargs.items())) if kwargs else ""
    
    # Create a hash of the arguments
    hash_input = f"{prefix}:{args_str}:{kwargs_str}"
    hash_obj = hashlib.md5(hash_input.encode())
    hash_str = hash_obj.hexdigest()
    
    return f"{prefix}:{hash_str}"


def get_cache(key: str) -> Optional[Dict[str, Any]]:
    """
    Get cached data by key
    
    Args:
        key: Cache key
        
    Returns:
        dict: Cached data or None
    """
    try:
        # Try to get from database cache
        cache_entry = Cache.find_by_key(key)
        
        if cache_entry:
            # Check if cache is expired
            if hasattr(cache_entry, 'expires_at') and cache_entry.expires_at:
                expires_at = datetime.fromisoformat(cache_entry.expires_at)
                if expires_at < now():
                    # Cache is expired
                    return None
            
            # Return cache data
            return cache_entry.data_value
        
        return None
    
    except Exception as e:
        logger.error(f"Error getting cache: {str(e)}")
        return None


def set_cache(key: str, data: Any, timeout: int = 3600) -> bool:
    """
    Set cached data
    
    Args:
        key: Cache key
        data: Data to cache
        timeout: Cache timeout in seconds
        
    Returns:
        bool: Success status
    """
    try:
        # Calculate expiration time
        expires_at = (now() + timedelta(seconds=timeout)).isoformat()
        
        # Check if cache exists
        cache_entry = Cache.find_by_key(key)
        
        if cache_entry:
            # Update existing cache
            cache_entry.data_value = data
            cache_entry.expires_at = expires_at
            cache_entry.updated_at = now().isoformat()
            return cache_entry.save()
        else:
            # Create new cache
            cache_entry = Cache(
                cache_key=key,
                data_value=data,
                expires_at=expires_at,
                created_at=now().isoformat(),
                updated_at=now().isoformat()
            )
            return cache_entry.save()
    
    except Exception as e:
        logger.error(f"Error setting cache: {str(e)}")
        return False


def delete_cache(key: str) -> bool:
    """
    Delete cached data
    
    Args:
        key: Cache key
        
    Returns:
        bool: Success status
    """
    try:
        # Delete from database cache
        cache_entry = Cache.find_by_key(key)
        
        if cache_entry:
            return cache_entry.delete()
        
        return True
    
    except Exception as e:
        logger.error(f"Error deleting cache: {str(e)}")
        return False


def clear_cache_by_prefix(prefix: str) -> bool:
    """
    Clear all cache with a specific prefix
    
    Args:
        prefix: Cache key prefix
        
    Returns:
        bool: Success status
    """
    try:
        # In a SQL database, we would use a LIKE query
        # Since we're using a generic model, we'll get all and filter
        all_cache = Cache.find_all()
        
        for cache_entry in all_cache:
            if cache_entry.cache_key.startswith(prefix):
                cache_entry.delete()
        
        return True
    
    except Exception as e:
        logger.error(f"Error clearing cache by prefix: {str(e)}")
        return False


def cache_result(timeout: int = 3600, prefix: str = None):
    """
    Decorator to cache function results
    
    Args:
        timeout: Cache timeout in seconds
        prefix: Cache key prefix
        
    Returns:
        function: Decorated function
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            func_prefix = prefix or f"func:{func.__module__}.{func.__name__}"
            cache_key = generate_cache_key(func_prefix, *args, **kwargs)
            
            # Try to get from cache
            cached_data = get_cache(cache_key)
            
            if cached_data is not None:
                logger.debug(f"Cache hit for {cache_key}")
                return cached_data
            
            # Not in cache, call the function
            logger.debug(f"Cache miss for {cache_key}")
            result = func(*args, **kwargs)
            
            # Cache the result
            set_cache(cache_key, result, timeout)
            
            return result
        
        return wrapper
    
    return decorator 