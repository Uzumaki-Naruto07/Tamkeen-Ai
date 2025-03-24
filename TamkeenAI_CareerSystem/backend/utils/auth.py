"""
Authentication Utility Module

This module provides utilities for authentication, authorization, and user management.
"""

import re
from typing import Dict, Any, Optional, Tuple, List
from functools import wraps
from flask import request, current_app, g
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

# Import database models
from backend.database.models import User


def validate_password(password: str) -> Tuple[bool, Optional[str]]:
    """
    Validate password strength
    
    Args:
        password: Password to validate
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one number"
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
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
    # Basic email regex pattern
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not re.match(pattern, email):
        return False, "Invalid email format"
    
    return True, None


def authenticate_user(email: str, password: str) -> Tuple[bool, Optional[User], Optional[str]]:
    """
    Authenticate user with email and password
    
    Args:
        email: User email
        password: User password
        
    Returns:
        tuple: (success, user, message)
    """
    # Validate email format
    is_valid, error = validate_email(email)
    if not is_valid:
        return False, None, error
    
    # Find user by email
    user = User.find_by_email(email)
    
    if not user:
        return False, None, "Invalid email or password"
    
    # Check password
    if not user.check_password(password):
        return False, None, "Invalid email or password"
    
    # Check if user is active
    if not user.is_active:
        return False, None, "Account is disabled"
    
    return True, user, None


def admin_required(fn):
    """
    Decorator for routes that require admin access
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # Verify JWT
        verify_jwt_in_request()
        
        # Get user ID from JWT
        user_id = get_jwt_identity()
        
        # Find user
        user = User.find_by_id(user_id)
        
        # Check if user is admin
        if not user or not user.is_admin:
            return {
                "error": True,
                "message": "Admin privileges required"
            }, 403
        
        # Store user in g for future use
        g.current_user = user
        
        return fn(*args, **kwargs)
    
    return wrapper


def get_current_user() -> Optional[User]:
    """
    Get current authenticated user
    
    Returns:
        User: Current user or None
    """
    # Check if user is already in g
    if hasattr(g, 'current_user'):
        return g.current_user
    
    try:
        # Verify JWT without raising exception
        verify_jwt_in_request(optional=True)
        
        # Get user ID from JWT
        user_id = get_jwt_identity()
        
        if user_id:
            # Find user
            user = User.find_by_id(user_id)
            
            # Store user in g for future use
            g.current_user = user
            
            return user
    except:
        pass
    
    return None


def generate_password_reset_token(user: User) -> str:
    """
    Generate password reset token for user
    
    Args:
        user: User object
        
    Returns:
        str: Reset token
    """
    import uuid
    import hashlib
    from datetime import datetime, timedelta
    
    # Generate token
    token = str(uuid.uuid4())
    
    # Hash token
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    
    # Set expiration to 24 hours from now
    expiration = datetime.now() + timedelta(hours=24)
    
    # Store token hash and expiration in user
    user.reset_token = token_hash
    user.reset_token_expiry = expiration
    user.save()
    
    return token


def verify_password_reset_token(token: str) -> Tuple[bool, Optional[User], Optional[str]]:
    """
    Verify password reset token
    
    Args:
        token: Reset token
        
    Returns:
        tuple: (is_valid, user, error_message)
    """
    import hashlib
    from datetime import datetime
    
    # Hash token
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    
    # Find user with this token
    users = User.find_by_reset_token(token_hash)
    
    if not users:
        return False, None, "Invalid or expired token"
    
    user = users[0]
    
    # Check if token has expired
    if user.reset_token_expiry and user.reset_token_expiry < datetime.now():
        return False, None, "Token has expired"
    
    return True, user, None


def log_login_attempt(user_id: str, success: bool, ip_address: str, user_agent: str) -> None:
    """
    Log login attempt
    
    Args:
        user_id: User ID
        success: Whether login was successful
        ip_address: Client IP address
        user_agent: Client user agent
    """
    from backend.database.models import UserActivity
    
    # Create activity log
    activity = UserActivity(
        user_id=user_id,
        activity_type="login" if success else "login_failed",
        activity_data=json.dumps({
            "ip_address": ip_address,
            "user_agent": user_agent,
            "timestamp": datetime.now().isoformat()
        })
    )
    
    activity.save() 