"""
Authentication Utility Module

This module provides utilities for user authentication, authorization,
password handling, and security.
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
import hmac
import base64
import jwt

# Try to import optional dependencies
try:
    import bcrypt
    BCRYPT_AVAILABLE = True
except ImportError:
    BCRYPT_AVAILABLE = False
    logging.warning("bcrypt not installed. Install with: pip install bcrypt")

try:
    import jwt
    JWT_AVAILABLE = True
except ImportError:
    JWT_AVAILABLE = False
    logging.warning("PyJWT not installed. Some token functions will be unavailable. Install with: pip install PyJWT")

# Import settings
from backend.config.settings import (
    SECRET_KEY, JWT_SECRET_KEY, JWT_ACCESS_TOKEN_EXPIRES, 
    JWT_REFRESH_TOKEN_EXPIRES, PASSWORD_MIN_LENGTH,
    PASSWORD_REQUIRE_UPPERCASE, PASSWORD_REQUIRE_LOWERCASE,
    PASSWORD_REQUIRE_DIGITS, PASSWORD_REQUIRE_SPECIAL
)

# Import database models
from backend.database.models import User, PasswordReset

# Setup logger
logger = logging.getLogger(__name__)


def hash_password(password: str) -> str:
    """
    Hash a password for secure storage
    
    Args:
        password: Plain text password
        
    Returns:
        str: Hashed password
    """
    # In a real application, use a proper password hashing library like bcrypt
    # For simplicity, we're using hashlib here
    salt = hashlib.sha256(os.urandom(60)).hexdigest().encode('ascii')
    pwd_hash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), 
                                  salt, 100000)
    pwd_hash = hashlib.sha256(pwd_hash).hexdigest()
    
    return (salt + pwd_hash.encode('ascii')).decode('ascii')


def verify_password(stored_password: str, provided_password: str) -> bool:
    """
    Verify a password against a stored hash
    
    Args:
        stored_password: Stored hashed password
        provided_password: Plain text password to verify
        
    Returns:
        bool: True if password matches, False otherwise
    """
    # In a real application, use a proper password hashing library like bcrypt
    # For simplicity, we're using hashlib here
    try:
        salt = stored_password[:64]
        stored_hash = stored_password[64:]
        pwd_hash = hashlib.pbkdf2_hmac('sha512', 
                                      provided_password.encode('utf-8'), 
                                      salt.encode('ascii'), 
                                      100000)
        pwd_hash = hashlib.sha256(pwd_hash).hexdigest()
        
        return pwd_hash == stored_hash
    except Exception as e:
        logger.error(f"Error verifying password: {str(e)}")
        return False


def validate_password_strength(password: str) -> Tuple[bool, str]:
    """
    Validate password strength
    
    Args:
        password: Password to validate
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if len(password) < PASSWORD_MIN_LENGTH:
        return False, f"Password must be at least {PASSWORD_MIN_LENGTH} characters long"
    
    if PASSWORD_REQUIRE_UPPERCASE and not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    
    if PASSWORD_REQUIRE_LOWERCASE and not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    
    if PASSWORD_REQUIRE_DIGITS and not any(c.isdigit() for c in password):
        return False, "Password must contain at least one digit"
    
    if PASSWORD_REQUIRE_SPECIAL and not any(c in "!@#$%^&*()-_=+[]{}|;:,.<>?/" for c in password):
        return False, "Password must contain at least one special character"
    
    return True, ""


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
        if not verify_password(user.password, password):
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


def generate_token(user_id: str, token_type: str = "access") -> str:
    """
    Generate JWT token
    
    Args:
        user_id: User ID
        token_type: Token type ('access' or 'refresh')
        
    Returns:
        str: JWT token
    """
    try:
        # Set expiration based on token type
        if token_type == "refresh":
            expires_delta = JWT_REFRESH_TOKEN_EXPIRES
        else:
            expires_delta = JWT_ACCESS_TOKEN_EXPIRES
        
        # Create payload
        payload = {
            'sub': user_id,
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + expires_delta,
            'type': token_type
        }
        
        # Generate token
        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256')
        
        return token
        
    except Exception as e:
        logger.error(f"Error generating token: {str(e)}")
        return ""


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode JWT token
    
    Args:
        token: JWT token
        
    Returns:
        dict: Token payload, or None if invalid
    """
    try:
        # Decode token
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
        
        return payload
        
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Error decoding token: {str(e)}")
        return None


def generate_csrf_token() -> str:
    """
    Generate CSRF token
    
    Returns:
        str: CSRF token
    """
    return secrets.token_urlsafe(32)


def validate_csrf_token(session_token: str, request_token: str) -> bool:
    """
    Validate CSRF token
    
    Args:
        session_token: Token from session
        request_token: Token from request
        
    Returns:
        bool: True if valid, False otherwise
    """
    return session_token == request_token


def get_permissions_for_role(role: str) -> List[str]:
    """
    Get permissions for a role
    
    Args:
        role: User role
        
    Returns:
        list: Permissions for the role
    """
    # Role-based permissions
    permissions = {
        "admin": [
            "user:read", "user:write", "user:delete",
            "job:read", "job:write", "job:delete",
            "resume:read", "resume:write", "resume:delete",
            "analytics:read", "analytics:write",
            "settings:read", "settings:write"
        ],
        "recruiter": [
            "user:read", 
            "job:read", "job:write",
            "resume:read",
            "analytics:read"
        ],
        "user": [
            "user:read:self", "user:write:self",
            "job:read",
            "resume:read:self", "resume:write:self",
            "analytics:read:self"
        ],
        "guest": [
            "job:read"
        ]
    }
    
    return permissions.get(role.lower(), permissions["guest"])


def has_permission(user_role: str, required_permission: str) -> bool:
    """
    Check if user has a specific permission
    
    Args:
        user_role: User role
        required_permission: Required permission
        
    Returns:
        bool: True if user has permission, False otherwise
    """
    user_permissions = get_permissions_for_role(user_role)
    
    # Check for exact permission match
    if required_permission in user_permissions:
        return True
    
    # Check for wildcard permissions
    if "*" in user_permissions:
        return True
    
    # Check for resource-level wildcard
    resource = required_permission.split(":")[0]
    if f"{resource}:*" in user_permissions:
        return True
    
    return False


def generate_reset_token(user_id: str, expires_in_hours: int = 24) -> str:
    """
    Generate a password reset token
    
    Args:
        user_id: User ID
        expires_in_hours: Token expiration in hours
        
    Returns:
        str: Reset token
    """
    if JWT_AVAILABLE:
        # Use JWT for token
        expiration = datetime.now() + timedelta(hours=expires_in_hours)
        
        payload = {
            "user_id": user_id,
            "purpose": "password_reset",
            "exp": expiration.timestamp()
        }
        
        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm="HS256")
        
        return token if isinstance(token, str) else token.decode('utf-8')
    else:
        # Fallback to simple token with HMAC
        token_data = f"{user_id}|password_reset|{int((datetime.now() + timedelta(hours=expires_in_hours)).timestamp())}"
        h = hmac.new(SECRET_KEY.encode('utf-8'), token_data.encode('utf-8'), hashlib.sha256)
        signature = h.hexdigest()
        
        token = base64.urlsafe_b64encode(f"{token_data}|{signature}".encode('utf-8')).decode('utf-8')
        
        return token


def verify_reset_token(token: str) -> Optional[str]:
    """
    Verify a password reset token
    
    Args:
        token: Reset token
        
    Returns:
        Optional[str]: User ID if token is valid, None otherwise
    """
    try:
        if JWT_AVAILABLE:
            # Decode JWT token
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
            
            # Verify purpose
            if payload.get("purpose") != "password_reset":
                return None
            
            # Return user ID
            return payload.get("user_id")
        else:
            # Decode fallback token
            token_data = base64.urlsafe_b64decode(token.encode('utf-8')).decode('utf-8')
            parts = token_data.split('|')
            
            if len(parts) != 4:
                return None
            
            user_id, purpose, expiry_str, signature = parts
            
            # Verify purpose
            if purpose != "password_reset":
                return None
            
            # Verify expiration
            expiry = datetime.fromtimestamp(float(expiry_str))
            if expiry < datetime.now():
                return None
            
            # Verify signature
            token_content = f"{user_id}|{purpose}|{expiry_str}"
            h = hmac.new(SECRET_KEY.encode('utf-8'), token_content.encode('utf-8'), hashlib.sha256)
            expected_signature = h.hexdigest()
            
            if signature != expected_signature:
                return None
            
            # Return user ID
            return user_id
    
    except Exception as e:
        logger.error(f"Error verifying reset token: {str(e)}")
        return None


def generate_verification_token(user_id: str) -> str:
    """
    Generate an email verification token
    
    Args:
        user_id: User ID
        
    Returns:
        str: Verification token
    """
    # Implementation similar to reset token
    return generate_reset_token(user_id, expires_in_hours=72)


def verify_verification_token(token: str) -> Optional[str]:
    """
    Verify an email verification token
    
    Args:
        token: Verification token
        
    Returns:
        Optional[str]: User ID if token is valid, None otherwise
    """
    # Implementation similar to reset token verification
    return verify_reset_token(token)


def generate_secure_random_string(length: int = 32) -> str:
    """
    Generate a secure random string
    
    Args:
        length: String length
        
    Returns:
        str: Random string
    """
    chars = string.ascii_letters + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length)) 