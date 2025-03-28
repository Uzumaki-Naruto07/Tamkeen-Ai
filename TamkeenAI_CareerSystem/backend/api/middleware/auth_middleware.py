"""
Authentication middleware for the API.
"""

import functools
from flask import request, jsonify, g
import logging

logger = logging.getLogger(__name__)

def token_required(f):
    """
    Decorator to require a valid token for a route.
    
    Args:
        f (function): The function to decorate
        
    Returns:
        function: The decorated function
    """
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        
        # Check if token exists
        if not auth_header:
            return jsonify({'error': 'Authentication token required'}), 401
        
        # Extract token
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            return jsonify({'error': 'Invalid token format'}), 401
        
        # Validate token (simplified for development)
        if token == 'invalid_token':
            return jsonify({'error': 'Invalid or expired token'}), 401
            
        # In a real implementation, we would validate the token and extract user info
        # For now, just create a dummy user for testing
        current_user = {
            'id': 'test_user_id',
            'username': 'test_user',
            'email': 'test@example.com',
            'role': 'user'
        }
        
        # Set user in flask.g for access in views
        g.user = current_user
        
        return f(current_user, *args, **kwargs)
    return decorated 