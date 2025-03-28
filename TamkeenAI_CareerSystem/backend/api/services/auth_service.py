"""
Authentication Service Module

This module handles user authentication and related functionality
including user management, token generation, and verification.
"""

import logging
from datetime import datetime, timedelta
from flask import g, request, jsonify
from functools import wraps
import jwt
import os

# Import database models
from api.database.models import User

# Setup logger
logger = logging.getLogger(__name__)

# Secret key for JWT
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'tamkeen-ai-secret-key')

def generate_token(user_id, expiry_hours=24):
    """
    Generate a JWT token for authentication.
    
    Args:
        user_id (str): User ID
        expiry_hours (int): Token expiry in hours
        
    Returns:
        str: JWT token
    """
    payload = {
        'sub': user_id,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(hours=expiry_hours)
    }
    
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token

def verify_token(token):
    """
    Verify a JWT token.
    
    Args:
        token (str): JWT token
        
    Returns:
        dict: Token payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        return None
    except jwt.InvalidTokenError:
        logger.warning("Invalid token")
        return None

def get_token_from_request():
    """
    Extract token from request headers.
    
    Returns:
        str: Token if found, None otherwise
    """
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        return auth_header.split(' ')[1]
    return None

def get_current_user():
    """
    Get the current authenticated user from the request context.
    
    Returns:
        User: User object if authenticated, None otherwise
    """
    if hasattr(g, 'user'):
        return g.user
    
    token = get_token_from_request()
    if not token:
        return None
    
    payload = verify_token(token)
    if not payload:
        return None
    
    user_id = payload.get('sub')
    if not user_id:
        return None
    
    # Look up user from database
    user = User.find_by_id(user_id)
    if not user:
        return None
        
    # Store in request context
    g.user = user
    return user

def auth_required(f):
    """
    Decorator to require authentication for a route.
    
    Args:
        f: Function to decorate
        
    Returns:
        function: Decorated function
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        
        user = get_current_user()
        if not user:
            return jsonify({
                'success': False,
                'error': 'Authentication required'
            }), 401
        
        return f(*args, **kwargs)
    return decorated

def login_required(f):
    """
    Decorator to check if the user is logged in.
    Validates JWT token and sets the user in Flask g object.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Check if token is in header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split('Bearer ')[1]
        
        if not token:
            return jsonify({
                'success': False,
                'message': 'Authentication required. Please log in.'
            }), 401
        
        try:
            # Decode token
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            
            # Set user in Flask g object
            g.user = {
                'id': payload['sub'],
                'email': payload.get('email', ''),
                'roles': payload.get('roles', ['user']),
                'name': payload.get('name', '')
            }
            
        except jwt.ExpiredSignatureError:
            return jsonify({
                'success': False,
                'message': 'Token has expired. Please log in again.'
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'success': False,
                'message': 'Invalid token. Please log in again.'
            }), 401
            
        return f(*args, **kwargs)
    
    return decorated_function

def admin_required(f):
    """
    Decorator to check if the user has admin role.
    Must be used after login_required decorator.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not hasattr(g, 'user'):
            return jsonify({
                'success': False,
                'message': 'Authentication required. Please log in.'
            }), 401
            
        if 'admin' not in g.user.get('roles', []):
            return jsonify({
                'success': False,
                'message': 'Admin access required. You do not have permission to access this resource.'
            }), 403
            
        return f(*args, **kwargs)
    
    return decorated_function

def generate_token(user_data, expires_in=24):
    """
    Generate a JWT token for the user.
    
    Args:
        user_data: User information
        expires_in: Token validity in hours
        
    Returns:
        JWT token
    """
    payload = {
        'user_id': user_data['id'],
        'email': user_data['email'],
        'roles': user_data.get('roles', ['user']),
        'name': user_data.get('name', ''),
        'exp': datetime.utcnow() + timedelta(hours=expires_in)
    }
    
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    
    return token