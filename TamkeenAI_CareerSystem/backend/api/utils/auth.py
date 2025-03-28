"""
Authentication utilities for TamkeenAI (simplified for testing).
"""

import os
import logging
import hashlib
import secrets
from functools import wraps
from flask import request, jsonify, g

# Setup logger
logger = logging.getLogger(__name__)

def hash_password(password):
    """
    Hash a password for storing (simplified version).
    
    Args:
        password: Password to hash
        
    Returns:
        Hashed password
    """
    # In a real app, use a secure hashing algorithm with salt
    # For simplicity, using a basic hash here
    salt = secrets.token_hex(16)
    hashable = password + salt
    hashed = hashlib.sha256(hashable.encode()).hexdigest()
    return f"{salt}${hashed}"

def verify_password(password, hashed_password):
    """
    Verify a stored password against a provided password.
    
    Args:
        password: Password to check
        hashed_password: Stored password hash
        
    Returns:
        True if matching, False otherwise
    """
    # In a real app, extract the salt and hash from the stored password
    # For simplicity, using a basic verification here
    if not hashed_password or '$' not in hashed_password:
        return False
    
    salt, stored_hash = hashed_password.split('$', 1)
    hashable = password + salt
    computed_hash = hashlib.sha256(hashable.encode()).hexdigest()
    return secrets.compare_digest(stored_hash, computed_hash)

def auth_required(f):
    """
    Dummy decorator for testing (no actual auth check).
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        # For testing, always allow the request
        g.user_id = '123'  # Mock user ID
        return f(*args, **kwargs)
    
    return decorated

def get_current_user():
    """
    Get the current authenticated user (mocked for testing).
    """
    return g.get('user_id', '123')  # Default to mock user ID 