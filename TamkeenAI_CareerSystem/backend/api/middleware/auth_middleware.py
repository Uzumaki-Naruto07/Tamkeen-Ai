from functools import wraps
from flask import request, jsonify
import jwt
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# For development, we'll use a simple token verification
# In production, you would use a proper JWT verification with your authentication service
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check if token is in headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        # Return error if no token provided
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        # In development mode, accept a simple token for testing
        if os.getenv('FLASK_ENV') == 'development' and token == 'development-token':
            # Create a mock user for development
            current_user = {
                'id': 1,
                'username': 'dev_user',
                'email': 'dev@example.com',
                'roles': ['user', 'admin']
            }
            return f(current_user, *args, **kwargs)
            
        try:
            # Decode the token
            secret_key = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')
            data = jwt.decode(token, secret_key, algorithms=['HS256'])
            
            # In a real app, you would fetch the user from the database
            # For now, we'll create a user object based on the token data
            current_user = {
                'id': data['user_id'],
                'username': data.get('username', ''),
                'email': data.get('email', ''),
                'roles': data.get('roles', ['user'])
            }
        except:
            return jsonify({'error': 'Token is invalid'}), 401
            
        # Pass the current user to the route
        return f(current_user, *args, **kwargs)
    
    return decorated 