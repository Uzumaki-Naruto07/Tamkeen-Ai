"""
JWT-based authentication for the API.
Provides token generation, validation, and role-based access control.
"""

import jwt
import datetime
from functools import wraps
from flask import request, jsonify, current_app, g

def generate_token(user_id, role='user'):
    """
    Generate JWT tokens for the user
    
    Args:
        user_id: The user ID
        role: The user role (default: 'user')
        
    Returns:
        tuple: (access_token, refresh_token)
    """
    # Access token - short lived (1 hour)
    access_payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1),
        'iat': datetime.datetime.utcnow(),
        'type': 'access'
    }
    
    # Refresh token - longer lived (7 days)
    refresh_payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
        'iat': datetime.datetime.utcnow(),
        'type': 'refresh'
    }
    
    access_token = jwt.encode(
        access_payload, 
        current_app.config.get('SECRET_KEY', 'tamkeen-ai-default-key'), 
        algorithm='HS256'
    )
    
    refresh_token = jwt.encode(
        refresh_payload,
        current_app.config.get('SECRET_KEY', 'tamkeen-ai-default-key'),
        algorithm='HS256'
    )
    
    return access_token, refresh_token

def decode_token(token):
    """
    Decode a JWT token
    
    Args:
        token: The JWT token to decode
        
    Returns:
        dict: The decoded token payload or error dictionary
    """
    try:
        payload = jwt.decode(
            token, 
            current_app.config.get('SECRET_KEY', 'tamkeen-ai-default-key'),
            algorithms=['HS256']
        )
        return payload
    except jwt.ExpiredSignatureError:
        return {'error': 'Token expired'}
    except jwt.InvalidTokenError:
        return {'error': 'Invalid token'}

def refresh_access_token(refresh_token):
    """
    Generate a new access token using a refresh token
    
    Args:
        refresh_token: The refresh token
        
    Returns:
        str: A new access token or None if the refresh token is invalid
    """
    payload = decode_token(refresh_token)
    
    if 'error' in payload or payload.get('type') != 'refresh':
        return None
    
    # Generate a new access token
    access_payload = {
        'user_id': payload['user_id'],
        'role': payload['role'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1),
        'iat': datetime.datetime.utcnow(),
        'type': 'access'
    }
    
    return jwt.encode(
        access_payload,
        current_app.config.get('SECRET_KEY', 'tamkeen-ai-default-key'),
        algorithm='HS256'
    )

def jwt_required(f):
    """
    Decorator for routes that require token authentication
    
    Usage:
        @app.route('/protected')
        @jwt_required
        def protected():
            return jsonify({'message': 'This is a protected route'})
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({
                'message': 'Authentication token is missing',
                'status': 'error'
            }), 401
        
        # Decode token
        payload = decode_token(token)
        
        if 'error' in payload:
            return jsonify({
                'message': payload['error'],
                'status': 'error'
            }), 401
        
        # Add user info to flask.g
        g.user = {
            'id': payload['user_id'],
            'role': payload['role']
        }
        
        # Add user_id and role to kwargs for the view function
        kwargs['user_id'] = payload['user_id']
        kwargs['role'] = payload['role']
        
        return f(*args, **kwargs)
    
    return decorated

def role_required(roles):
    """
    Decorator for routes that require specific roles
    
    Usage:
        @app.route('/admin')
        @jwt_required
        @role_required(['admin'])
        def admin_route():
            return jsonify({'message': 'This is an admin route'})
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if 'role' not in kwargs:
                return jsonify({
                    'message': 'Authentication required',
                    'status': 'error'
                }), 401
            
            if kwargs['role'] not in roles:
                return jsonify({
                    'message': 'Insufficient permissions',
                    'status': 'error'
                }), 403
            
            return f(*args, **kwargs)
        return decorated
    return decorator 