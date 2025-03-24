"""
Authentication Utility Module

This module provides utilities for user authentication, authorization, and security.
"""

import os
import re
import json
import uuid
import time
import logging
import hashlib
import secrets
import string
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime, timedelta

# Try to import optional dependencies
try:
    import bcrypt
    BCRYPT_AVAILABLE = True
except ImportError:
    BCRYPT_AVAILABLE = False
    logging.warning("bcrypt not installed. Install with: pip install bcrypt")

# Import settings
from backend.config.settings import (
    SECRET_KEY, JWT_SECRET_KEY, PASSWORD_MIN_LENGTH, PASSWORD_REQUIRE_UPPERCASE,
    PASSWORD_REQUIRE_LOWERCASE, PASSWORD_REQUIRE_DIGITS, PASSWORD_REQUIRE_SPECIAL
)

# Import database models
from backend.database.models import User, PasswordReset

# Setup logger
logger = logging.getLogger(__name__)


def hash_password(password: str) -> str:
    """
    Hash password using bcrypt or fallback to PBKDF2
    
    Args:
        password: Plain text password
        
    Returns:
        str: Hashed password
    """
    if BCRYPT_AVAILABLE:
        # Generate salt and hash with bcrypt
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    else:
        # Fallback to PBKDF2
        salt = secrets.token_hex(16)
        iterations = 100000  # High iteration count for security
        
        hash_obj = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            iterations
        )
        
        # Format: algorithm$iterations$salt$hash
        return f"pbkdf2_sha256${iterations}${salt}${hash_obj.hex()}"


def verify_password(password: str, hashed_password: str) -> bool:
    """
    Verify password against hash
    
    Args:
        password: Plain text password
        hashed_password: Hashed password
        
    Returns:
        bool: True if password matches
    """
    if BCRYPT_AVAILABLE and not hashed_password.startswith('pbkdf2_sha256$'):
        # Verify with bcrypt
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    else:
        # Verify with PBKDF2
        try:
            # Parse hash components
            algorithm, iterations, salt, hash_value = hashed_password.split('$', 3)
            iterations = int(iterations)
            
            # Calculate hash with same parameters
            hash_obj = hashlib.pbkdf2_hmac(
                'sha256',
                password.encode('utf-8'),
                salt.encode('utf-8'),
                iterations
            )
            
            return hash_obj.hex() == hash_value
        except Exception as e:
            logger.error(f"Password verification error: {str(e)}")
            return False


def validate_password(password: str) -> Tuple[bool, Optional[str]]:
    """
    Validate password strength
    
    Args:
        password: Password to validate
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if not password:
        return False, "Password cannot be empty"
    
    if len(password) < PASSWORD_MIN_LENGTH:
        return False, f"Password must be at least {PASSWORD_MIN_LENGTH} characters long"
    
    if PASSWORD_REQUIRE_UPPERCASE and not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    
    if PASSWORD_REQUIRE_LOWERCASE and not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    
    if PASSWORD_REQUIRE_DIGITS and not any(c.isdigit() for c in password):
        return False, "Password must contain at least one digit"
    
    if PASSWORD_REQUIRE_SPECIAL:
        special_chars = set(string.punctuation)
        if not any(c in special_chars for c in password):
            return False, "Password must contain at least one special character"
    
    return True, None


def validate_email(email: str) -> Tuple[bool, Optional[str]]:
    """
    Validate email format
    
    Args:
        email: Email to validate
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if not email:
        return False, "Email cannot be empty"
    
    # Simple regex for email validation
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not re.match(email_pattern, email):
        return False, "Invalid email format"
    
    return True, None


def generate_password_reset_token() -> str:
    """
    Generate secure token for password reset
    
    Returns:
        str: Reset token
    """
    # Generate a secure random token
    token = secrets.token_urlsafe(32)
    
    return token


def verify_password_reset_token(token: str) -> Tuple[bool, Optional[str]]:
    """
    Verify password reset token
    
    Args:
        token: Reset token
        
    Returns:
        tuple: (is_valid, user_id)
    """
    try:
        # Find token in database
        resets = PasswordReset.find_by_token(token)
        
        if not resets:
            return False, None
        
        reset = resets[0]
        
        # Check if token is expired
        expires_at = datetime.fromisoformat(reset.expires_at)
        
        if datetime.now() > expires_at:
            return False, None
        
        # Check if token is used
        if reset.used:
            return False, None
        
        return True, reset.user_id
    
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        return False, None


def authenticate_user(email: str, password: str) -> Tuple[bool, Optional[Dict[str, Any]]]:
    """
    Authenticate user with email and password
    
    Args:
        email: User email
        password: User password
        
    Returns:
        tuple: (success, user_data)
    """
    try:
        # Find user by email
        users = User.find_by_email(email)
        
        if not users:
            return False, None
        
        user = users[0]
        
        # Check if user is active
        if not user.is_active:
            return False, None
        
        # Verify password
        if not verify_password(password, user.password):
            return False, None
        
        # Return user data
        return True, user.to_dict()
    
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        return False, None


def generate_api_key() -> str:
    """
    Generate API key
    
    Returns:
        str: API key
    """
    # Format: prefix_random_checksum
    prefix = "tamkeen"
    random_part = secrets.token_hex(16)
    
    # Add checksum
    data = f"{prefix}_{random_part}"
    checksum = hashlib.sha256(data.encode('utf-8')).hexdigest()[:8]
    
    return f"{data}_{checksum}"


def verify_api_key(api_key: str) -> bool:
    """
    Verify API key format and checksum
    
    Args:
        api_key: API key
        
    Returns:
        bool: True if valid format
    """
    try:
        # Split components
        parts = api_key.split('_')
        
        if len(parts) != 3:
            return False
        
        prefix, random_part, checksum = parts
        
        # Verify prefix
        if prefix != "tamkeen":
            return False
        
        # Verify checksum
        data = f"{prefix}_{random_part}"
        expected_checksum = hashlib.sha256(data.encode('utf-8')).hexdigest()[:8]
        
        return checksum == expected_checksum
    
    except Exception:
        return False 