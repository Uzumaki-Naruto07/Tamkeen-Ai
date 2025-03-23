import os
import re
import json
import time
import hashlib
import logging
import random
import string
import uuid
from typing import Dict, List, Tuple, Any, Optional, Union, Callable
from datetime import datetime, timedelta
import unicodedata
import base64
import urllib.parse
import traceback
import functools
import threading
import asyncio

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

logger = logging.getLogger("tamkeen_utils")

# ===========================
# Date and Time Utilities
# ===========================

def get_current_timestamp() -> int:
    """Get current Unix timestamp in seconds"""
    return int(time.time())

def format_timestamp(timestamp: Union[int, float], format_str: str = "%Y-%m-%d %H:%M:%S") -> str:
    """Format a Unix timestamp into a human-readable date string"""
    if isinstance(timestamp, (int, float)):
        dt = datetime.fromtimestamp(timestamp)
        return dt.strftime(format_str)
    return ""

def parse_date_string(date_str: str, formats: List[str] = None) -> Optional[datetime]:
    """
    Parse a date string using multiple possible formats
    
    Args:
        date_str: Date string to parse
        formats: List of format strings to try (if None, uses common formats)
        
    Returns:
        datetime object or None if parsing fails
    """
    if not formats:
        formats = [
            "%Y-%m-%d",
            "%Y/%m/%d",
            "%d-%m-%Y",
            "%d/%m/%Y",
            "%m-%d-%Y",
            "%m/%d/%Y",
            "%Y-%m-%d %H:%M:%S",
            "%Y/%m/%d %H:%M:%S",
            "%d-%m-%Y %H:%M:%S",
            "%d/%m/%Y %H:%M:%S",
            "%m-%d-%Y %H:%M:%S",
            "%m/%d/%Y %H:%M:%S",
        ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    
    return None

def calculate_date_difference(date1: Union[datetime, str], date2: Union[datetime, str] = None) -> Dict[str, int]:
    """
    Calculate difference between two dates in years, months, days
    
    Args:
        date1: First date (datetime or string)
        date2: Second date (defaults to current date if None)
        
    Returns:
        Dictionary with 'years', 'months', and 'days' keys
    """
    # Convert string dates to datetime objects
    if isinstance(date1, str):
        date1 = parse_date_string(date1)
        if not date1:
            raise ValueError("Invalid date1 format")
    
    if date2 is None:
        date2 = datetime.now()
    elif isinstance(date2, str):
        date2 = parse_date_string(date2)
        if not date2:
            raise ValueError("Invalid date2 format")
    
    # Ensure date1 is earlier than date2
    if date1 > date2:
        date1, date2 = date2, date1
    
    # Calculate difference
    years = date2.year - date1.year
    months = date2.month - date1.month
    days = date2.day - date1.day
    
    # Adjust for negative months/days
    if days < 0:
        months -= 1
        last_month = date2.replace(day=1) - timedelta(days=1)
        days += last_month.day
    
    if months < 0:
        years -= 1
        months += 12
    
    return {
        "years": years,
        "months": months,
        "days": days,
        "total_days": (date2 - date1).days
    }

# ===========================
# Text Processing Utilities
# ===========================

def slugify(text: str) -> str:
    """
    Convert text to URL-friendly slug
    
    Args:
        text: Input text
        
    Returns:
        URL-friendly slug
    """
    # Normalize unicode characters
    text = unicodedata.normalize('NFKD', text)
    
    # Convert to ASCII, ignore non-ASCII characters
    text = ''.join([c for c in text if not unicodedata.combining(c) and c.isascii()])
    
    # Convert to lowercase, replace spaces with hyphens
    text = re.sub(r'[^\w\s-]', '', text.lower())
    text = re.sub(r'[-\s]+', '-', text).strip('-_')
    
    return text

def clean_html(html_text: str) -> str:
    """Remove HTML tags from text"""
    if not html_text:
        return ""
    
    # Simple regex to remove HTML tags
    clean_text = re.sub(r'<[^>]+>', '', html_text)
    
    # Replace common HTML entities
    entities = {
        '&nbsp;': ' ',
        '&lt;': '<',
        '&gt;': '>',
        '&amp;': '&',
        '&quot;': '"',
        '&apos;': "'",
    }
    
    for entity, replacement in entities.items():
        clean_text = clean_text.replace(entity, replacement)
    
    # Handle numeric entities
    clean_text = re.sub(r'&#(\d+);', lambda m: chr(int(m.group(1))), clean_text)
    
    return clean_text

def truncate_text(text: str, max_length: int = 100, ellipsis: str = "...") -> str:
    """Truncate text to a maximum length, adding ellipsis if needed"""
    if not text or len(text) <= max_length:
        return text
    
    # Truncate at word boundary when possible
    truncated = text[:max_length]
    last_space = truncated.rfind(" ")
    
    if last_space > max_length * 0.8:  # Only use word boundary if it's not too far back
        return text[:last_space] + ellipsis
    else:
        return truncated + ellipsis

def extract_keywords(text: str, min_length: int = 3, max_keywords: int = 10) -> List[str]:
    """
    Extract potential keywords from text
    
    Args:
        text: Input text
        min_length: Minimum keyword length
        max_keywords: Maximum number of keywords to return
        
    Returns:
        List of potential keywords
    """
    # Remove special characters and convert to lowercase
    clean_text = re.sub(r'[^\w\s]', '', text.lower())
    
    # Split into words
    words = clean_text.split()
    
    # Remove common stopwords
    stopwords = {
        'a', 'an', 'the', 'and', 'or', 'but', 'if', 'because', 'as', 'what',
        'when', 'where', 'how', 'who', 'which', 'this', 'that', 'to', 'in',
        'on', 'for', 'with', 'by', 'at', 'from', 'is', 'are', 'was', 'were',
        'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
        'of', 'up', 'down', 'over', 'under', 'again'
    }
    
    filtered_words = [w for w in words if w not in stopwords and len(w) >= min_length]
    
    # Count word frequencies
    word_counts = {}
    for word in filtered_words:
        word_counts[word] = word_counts.get(word, 0) + 1
    
    # Sort by frequency
    sorted_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)
    
    # Return top keywords
    return [word for word, count in sorted_words[:max_keywords]]

# ===========================
# Data Validation Utilities
# ===========================

def is_valid_email(email: str) -> bool:
    """Check if a string is a valid email address"""
    if not email:
        return False
    
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(email_pattern, email))

def is_valid_phone(phone: str) -> bool:
    """Check if a string is a valid phone number"""
    if not phone:
        return False
    
    # Remove common formatting characters
    clean_phone = re.sub(r'[\s\-\(\)\+\.]', '', phone)
    
    # Check if it's all digits and a reasonable length
    return clean_phone.isdigit() and 7 <= len(clean_phone) <= 15

def is_valid_url(url: str) -> bool:
    """Check if a string is a valid URL"""
    if not url:
        return False
    
    url_pattern = r'^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$'
    return bool(re.match(url_pattern, url))

def validate_data(data: Dict[str, Any], schema: Dict[str, Dict[str, Any]]) -> Tuple[bool, List[str]]:
    """
    Validate data against a schema
    
    Args:
        data: Dictionary of data to validate
        schema: Dictionary defining validation rules
        
    Returns:
        Tuple of (is_valid, error_messages)
    """
    errors = []
    
    for field, rules in schema.items():
        # Check if required field is missing
        if rules.get('required', False) and (field not in data or data[field] is None):
            errors.append(f"Missing required field: {field}")
            continue
        
        # Skip validation if field is not present
        if field not in data or data[field] is None:
            continue
        
        value = data[field]
        
        # Type validation
        if 'type' in rules:
            expected_type = rules['type']
            if expected_type == 'string' and not isinstance(value, str):
                errors.append(f"Field {field} should be a string")
            elif expected_type == 'number' and not isinstance(value, (int, float)):
                errors.append(f"Field {field} should be a number")
            elif expected_type == 'integer' and not isinstance(value, int):
                errors.append(f"Field {field} should be an integer")
            elif expected_type == 'boolean' and not isinstance(value, bool):
                errors.append(f"Field {field} should be a boolean")
            elif expected_type == 'array' and not isinstance(value, list):
                errors.append(f"Field {field} should be an array")
            elif expected_type == 'object' and not isinstance(value, dict):
                errors.append(f"Field {field} should be an object")
        
        # String validations
        if isinstance(value, str):
            if 'min_length' in rules and len(value) < rules['min_length']:
                errors.append(f"Field {field} should be at least {rules['min_length']} characters")
            if 'max_length' in rules and len(value) > rules['max_length']:
                errors.append(f"Field {field} should be at most {rules['max_length']} characters")
            if 'pattern' in rules and not re.match(rules['pattern'], value):
                errors.append(f"Field {field} does not match the required pattern")
        
        # Numeric validations
        if isinstance(value, (int, float)):
            if 'min' in rules and value < rules['min']:
                errors.append(f"Field {field} should be greater than or equal to {rules['min']}")
            if 'max' in rules and value > rules['max']:
                errors.append(f"Field {field} should be less than or equal to {rules['max']}")
        
        # Array validations
        if isinstance(value, list):
            if 'min_items' in rules and len(value) < rules['min_items']:
                errors.append(f"Field {field} should have at least {rules['min_items']} items")
            if 'max_items' in rules and len(value) > rules['max_items']:
                errors.append(f"Field {field} should have at most {rules['max_items']} items")
        
        # Custom validation function
        if 'custom_validator' in rules and callable(rules['custom_validator']):
            custom_result = rules['custom_validator'](value)
            if custom_result is not True:
                errors.append(custom_result if isinstance(custom_result, str) else f"Field {field} failed custom validation")
    
    return len(errors) == 0, errors

# ===========================
# File Utilities
# ===========================

def ensure_directory(directory: str) -> str:
    """Ensure a directory exists, creating it if necessary"""
    if not os.path.exists(directory):
        os.makedirs(directory, exist_ok=True)
    return directory

def get_file_extension(filename: str) -> str:
    """Get the extension of a file (lowercase, without the dot)"""
    if not filename:
        return ""
    return os.path.splitext(filename)[1].lower().lstrip(".")

def is_valid_file_type(filename: str, allowed_types: List[str]) -> bool:
    """Check if a file has an allowed extension"""
    extension = get_file_extension(filename)
    return extension.lower() in [t.lower().lstrip(".") for t in allowed_types]

def get_mime_type(filename: str) -> str:
    """Get the MIME type of a file based on its extension"""
    extension = get_file_extension(filename).lower()
    
    mime_types = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'txt': 'text/plain',
        'csv': 'text/csv',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'json': 'application/json',
        'xml': 'application/xml',
        'html': 'text/html',
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'mp4': 'video/mp4',
        'zip': 'application/zip',
    }
    
    return mime_types.get(extension, 'application/octet-stream')

def get_safe_filename(filename: str) -> str:
    """
    Generate a safe filename by removing potentially unsafe characters
    
    Args:
        filename: Original filename
        
    Returns:
        Safe filename with unsafe characters removed
    """
    # Remove path information
    base_filename = os.path.basename(filename)
    
    # Replace unsafe characters
    safe_name = re.sub(r'[^\w\.\-]', '_', base_filename)
    
    return safe_name

# ===========================
# Security Utilities
# ===========================

def generate_random_token(length: int = 32) -> str:
    """Generate a random secure token"""
    return ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(length))

def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
    """
    Hash a password using a salt
    
    Args:
        password: Password to hash
        salt: Optional salt (generated if not provided)
        
    Returns:
        Tuple of (password_hash, salt)
    """
    if not salt:
        salt = generate_random_token(16)
    
    # Combine password and salt
    salted_password = (password + salt).encode('utf-8')
    
    # Hash using SHA-256
    password_hash = hashlib.sha256(salted_password).hexdigest()
    
    return password_hash, salt

def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    """
    Verify a password against a stored hash
    
    Args:
        password: Password to verify
        stored_hash: Stored password hash
        salt: Salt used for hashing
        
    Returns:
        True if password matches, False otherwise
    """
    calculated_hash, _ = hash_password(password, salt)
    return calculated_hash == stored_hash

def generate_unique_id() -> str:
    """Generate a unique ID (using UUID4)"""
    return str(uuid.uuid4())

# ===========================
# API and Request Utilities
# ===========================

def parse_query_string(query_string: str) -> Dict[str, str]:
    """Parse a URL query string into a dictionary"""
    if not query_string:
        return {}
    
    # Remove leading '?' if present
    if query_string.startswith('?'):
        query_string = query_string[1:]
    
    # Parse query string
    params = {}
    for param in query_string.split('&'):
        if '=' in param:
            key, value = param.split('=', 1)
            params[urllib.parse.unquote(key)] = urllib.parse.unquote(value)
    
    return params

def build_query_string(params: Dict[str, Any]) -> str:
    """Build a URL query string from a dictionary"""
    if not params:
        return ""
    
    query_parts = []
    for key, value in params.items():
        if value is not None:
            key = urllib.parse.quote(str(key))
            value = urllib.parse.quote(str(value))
            query_parts.append(f"{key}={value}")
    
    return "?" + "&".join(query_parts) if query_parts else ""

def format_api_response(data: Any = None, error: str = None, 
                       status: str = None, meta: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Format a consistent API response
    
    Args:
        data: Response data (default None)
        error: Error message (default None)
        status: Status message (default "success" or "error")
        meta: Additional metadata (default empty dict)
        
    Returns:
        Formatted API response dictionary
    """
    if status is None:
        status = "error" if error else "success"
    
    response = {
        "status": status,
        "timestamp": datetime.now().isoformat()
    }
    
    if data is not None:
        response["data"] = data
    
    if error:
        response["error"] = error
    
    if meta:
        response["meta"] = meta
    
    return response

# ===========================
# Error Handling Utilities
# ===========================

def safe_execute(func: Callable, *args, **kwargs) -> Tuple[Any, Optional[Exception]]:
    """
    Execute a function safely, catching any exceptions
    
    Args:
        func: Function to execute
        *args, **kwargs: Arguments to pass to the function
        
    Returns:
        Tuple of (result, exception) - if no exception, the second value is None
    """
    try:
        result = func(*args, **kwargs)
        return result, None
    except Exception as e:
        return None, e

def format_exception(exception: Exception) -> Dict[str, Any]:
    """
    Format an exception into a dictionary with details
    
    Args:
        exception: Exception to format
        
    Returns:
        Dictionary with exception details
    """
    return {
        "type": exception.__class__.__name__,
        "message": str(exception),
        "traceback": traceback.format_exc()
    }

def retry_operation(max_attempts: int = 3, delay: float = 1.0, 
                  backoff_factor: float = 2.0, exceptions: Tuple = (Exception,)) -> Callable:
    """
    Decorator to retry a function on failure
    
    Args:
        max_attempts: Maximum number of attempts
        delay: Initial delay between attempts (seconds)
        backoff_factor: Factor to increase delay by after each attempt
        exceptions: Tuple of exceptions to catch and retry
        
    Returns:
        Decorated function
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            current_delay = delay
            last_exception = None
            
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt < max_attempts - 1:
                        logger.warning(f"Attempt {attempt + 1}/{max_attempts} failed: {str(e)}. Retrying in {current_delay:.2f}s")
                        time.sleep(current_delay)
                        current_delay *= backoff_factor
                    else:
                        logger.error(f"All {max_attempts} attempts failed. Last error: {str(e)}")
            
            # If we get here, all attempts failed
            raise last_exception
        
        return wrapper
    
    return decorator

# ===========================
# Configuration Utilities
# ===========================

def load_config(config_path: str) -> Dict[str, Any]:
    """
    Load configuration from a JSON file
    
    Args:
        config_path: Path to configuration file
        
    Returns:
        Configuration dictionary
    """
    if not os.path.exists(config_path):
        logger.warning(f"Configuration file not found: {config_path}")
        return {}
    
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading configuration: {str(e)}")
        return {}

def save_config(config: Dict[str, Any], config_path: str) -> bool:
    """
    Save configuration to a JSON file
    
    Args:
        config: Configuration dictionary
        config_path: Path to save configuration file
        
    Returns:
        True if successful, False otherwise
    """
    try:
        directory = os.path.dirname(config_path)
        if directory and not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)
        
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
        
        return True
    except Exception as e:
        logger.error(f"Error saving configuration: {str(e)}")
        return False

def merge_configs(base_config: Dict[str, Any], override_config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Recursively merge two configuration dictionaries
    
    Args:
        base_config: Base configuration
        override_config: Configuration to override base values
        
    Returns:
        Merged configuration dictionary
    """
    result = base_config.copy()
    
    for key, override_value in override_config.items():
        if (
            key in result and 
            isinstance(result[key], dict) and 
            isinstance(override_value, dict)
        ):
            # Recursively merge nested dictionaries
            result[key] = merge_configs(result[key], override_value)
        else:
            # Override or add the value
            result[key] = override_value
    
    return result

# ===========================
# Miscellaneous Utilities
# ===========================

def get_environment() -> str:
    """Get the current environment (development, test, production)"""
    return os.environ.get('ENVIRONMENT', 'development').lower()

def is_production() -> bool:
    """Check if the current environment is production"""
    return get_environment() == 'production'

def is_development() -> bool:
    """Check if the current environment is development"""
    return get_environment() == 'development'

def rate_limit(key: str, max_calls: int, time_period: int, 
             storage: Dict[str, Dict[str, Any]] = None) -> bool:
    """
    Simple in-memory rate limiter
    
    Args:
        key: Identifier for the rate limit (e.g., user_id or IP)
        max_calls: Maximum number of calls allowed in the time period
        time_period: Time period in seconds
        storage: Optional external storage dict (defaults to internal dict)
        
    Returns:
        True if request is allowed, False if rate limit exceeded
    """
    # Use provided storage or internal dict
    if storage is None:
        if not hasattr(rate_limit, '_storage'):
            rate_limit._storage = {}
        storage = rate_limit._storage
    
    current_time = time.time()
    
    # Get or create record for this key
    if key not in storage:
        storage[key] = {
            'calls': 0,
            'reset_time': current_time + time_period
        }
    
    record = storage[key]
    
    # Reset if time period has passed
    if current_time > record['reset_time']:
        record['calls'] = 0
        record['reset_time'] = current_time + time_period
    
    # Check if limit exceeded
    if record['calls'] >= max_calls:
        return False
    
    # Increment counter
    record['calls'] += 1
    return True

def memoize(ttl: Optional[int] = None):
    """
    Memoization decorator with optional time-to-live
    
    Args:
        ttl: Time-to-live in seconds (None for no expiration)
        
    Returns:
        Decorated function with memoization
    """
    def decorator(func):
        cache = {}
        
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Create a cache key from the function arguments
            key_parts = [str(arg) for arg in args]
            key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
            cache_key = hashlib.md5(";".join(key_parts).encode()).hexdigest()
            
            current_time = time.time()
            
            # Check if result is in cache and not expired
            if cache_key in cache:
                result, timestamp = cache[cache_key]
                if ttl is None or current_time - timestamp < ttl:
                    return result
            
            # Call the function and cache the result
            result = func(*args, **kwargs)
            cache[cache_key] = (result, current_time)
            
            return result
        
        # Add function to clear cache
        wrapper.clear_cache = lambda: cache.clear()
        
        return wrapper
    
    return decorator
