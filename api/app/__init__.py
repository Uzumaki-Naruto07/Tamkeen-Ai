"""
Main app module for TamkeenAI API.
"""

import os
import logging
from functools import wraps
from flask import request, jsonify, g
import jwt
from datetime import datetime, timedelta

# Setup logger
logger = logging.getLogger(__name__)

# Decorator for requiring authentication
def require_auth(f):
    """Decorator to require authentication for a route."""
    @wraps(f)
    def decorated(*args, **kwargs):
        # Get the token from the Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'message': 'Authentication required'
            }), 401
        
        token = auth_header.split(' ')[1]
        
        try:
            # Verify token
            secret_key = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
            payload = jwt.decode(token, secret_key, algorithms=['HS256'])
            
            # Store user info in request context
            g.user_id = payload['sub']
            g.user_role = payload.get('role', 'user')
            
        except jwt.ExpiredSignatureError:
            return jsonify({
                'success': False,
                'message': 'Token expired'
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'success': False,
                'message': 'Invalid token'
            }), 401
        
        return f(*args, **kwargs)
    
    return decorated

# Decorator for requiring a specific role
def require_role(role):
    """Decorator to require a specific role for a route."""
    def decorator(f):
        @wraps(f)
        @require_auth
        def decorated_function(*args, **kwargs):
            if g.user_role != role:
                return jsonify({
                    'success': False,
                    'message': f'Role {role} required'
                }), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator 