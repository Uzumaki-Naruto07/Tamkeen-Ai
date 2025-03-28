"""
Authentication middleware for TamkeenAI API.
"""

import os
import jwt
import logging
from functools import wraps
from flask import request, jsonify, g
from datetime import datetime

# Setup logger
logger = logging.getLogger(__name__)

def token_required(f):
    """
    Decorator to verify a JWT token in the request Authorization header.
    Stores the decoded token payload in Flask's g object for access in route handlers.
    
    Args:
        f: The function to decorate
        
    Returns:
        Decorated function
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        # Check if token exists
        if not token:
            return jsonify({
                'success': False,
                'message': 'Token is missing',
                'timestamp': datetime.now().isoformat()
            }), 401
        
        try:
            # Decode token
            secret_key = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
            payload = jwt.decode(token, secret_key, algorithms=['HS256'])
            
            # Store current_user in g for access in route handlers
            class User:
                def __init__(self, id, email=None, role=None):
                    self.id = id
                    self.email = email
                    self.role = role
            
            current_user = User(
                id=payload['sub'],
                email=payload.get('email'),
                role=payload.get('role', 'user')
            )
            
            # Store in Flask's g object
            g.current_user = current_user
            
        except jwt.ExpiredSignatureError:
            return jsonify({
                'success': False,
                'message': 'Token has expired',
                'timestamp': datetime.now().isoformat()
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'success': False,
                'message': 'Invalid token',
                'timestamp': datetime.now().isoformat()
            }), 401
        
        # Call the original function
        return f(current_user, *args, **kwargs)
    
    return decorated

def admin_required(f):
    """
    Decorator to verify a user has admin role.
    Must be used in conjunction with token_required.
    
    Args:
        f: The function to decorate
        
    Returns:
        Decorated function
    """
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        # Check if user has admin role
        if current_user.role != 'admin':
            return jsonify({
                'success': False,
                'message': 'Admin privileges required',
                'timestamp': datetime.now().isoformat()
            }), 403
        
        # Call the original function
        return f(current_user, *args, **kwargs)
    
    return decorated 