"""
Authentication routes for the API.
Provides login, logout, token refresh, and registration endpoints.
"""

from flask import Blueprint, request, jsonify
from ..middleware.auth import generate_token, refresh_access_token, jwt_required

# Sample user database (in a real app, this would be in a database)
USERS = {
    'admin@tamkeen.ai': {
        'id': 1,
        'password': 'admin123',
        'role': 'admin',
        'name': 'Admin User'
    },
    'user@tamkeen.ai': {
        'id': 2,
        'password': 'user123',
        'role': 'user',
        'name': 'Regular User'
    }
}

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login endpoint that returns JWT tokens"""
    data = request.json
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({
            'message': 'Email and password are required',
            'status': 'error'
        }), 400
    
    email = data.get('email')
    password = data.get('password')
    
    user = USERS.get(email)
    
    if not user or user['password'] != password:
        return jsonify({
            'message': 'Invalid credentials',
            'status': 'error'
        }), 401
    
    access_token, refresh_token = generate_token(user['id'], user['role'])
    
    return jsonify({
        'message': 'Login successful',
        'status': 'success',
        'token': access_token,
        'refreshToken': refresh_token,
        'user': {
            'id': user['id'],
            'email': email,
            'name': user['name'],
            'role': user['role']
        }
    }), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.json
    
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({
            'message': 'Email, password, and name are required',
            'status': 'error'
        }), 400
    
    email = data.get('email')
    
    if email in USERS:
        return jsonify({
            'message': 'Email already exists',
            'status': 'error'
        }), 409
    
    # In a real app, we would hash the password before storing it
    new_user = {
        'id': len(USERS) + 1,
        'password': data.get('password'),
        'role': 'user',
        'name': data.get('name')
    }
    
    USERS[email] = new_user
    
    access_token, refresh_token = generate_token(new_user['id'], new_user['role'])
    
    return jsonify({
        'message': 'Registration successful',
        'status': 'success',
        'token': access_token,
        'refreshToken': refresh_token,
        'user': {
            'id': new_user['id'],
            'email': email,
            'name': new_user['name'],
            'role': new_user['role']
        }
    }), 201

@auth_bp.route('/refresh-token', methods=['POST'])
def refresh_token():
    """Refresh token endpoint"""
    data = request.json
    
    if not data or not data.get('refreshToken'):
        return jsonify({
            'message': 'Refresh token is required',
            'status': 'error'
        }), 400
    
    new_access_token = refresh_access_token(data.get('refreshToken'))
    
    if not new_access_token:
        return jsonify({
            'message': 'Invalid or expired refresh token',
            'status': 'error'
        }), 401
    
    return jsonify({
        'message': 'Token refreshed',
        'status': 'success',
        'token': new_access_token
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required
def logout(user_id, role):
    """Logout endpoint (client should remove tokens)"""
    # In a real app with a token blacklist, we would add the token to the blacklist
    
    return jsonify({
        'message': 'Logout successful',
        'status': 'success'
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required
def get_current_user(user_id, role):
    """Get current authenticated user"""
    # Find user by id
    user = None
    for email, data in USERS.items():
        if data['id'] == user_id:
            user = {
                'id': data['id'],
                'email': email,
                'name': data['name'],
                'role': data['role']
            }
            break
    
    if not user:
        return jsonify({
            'message': 'User not found',
            'status': 'error'
        }), 404
    
    return jsonify({
        'message': 'User retrieved',
        'status': 'success',
        'data': user
    }), 200
