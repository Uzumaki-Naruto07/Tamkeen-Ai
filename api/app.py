from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from .auth import generate_token, token_required, role_required, refresh_access_token

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'tamkeen-ai-secret-key')

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

@app.route('/api/auth/login', methods=['POST'])
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

@app.route('/api/auth/refresh-token', methods=['POST'])
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

@app.route('/api/user/profile', methods=['GET'])
@token_required
def get_profile(user_id, role):
    """Protected endpoint to get user profile"""
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
        'message': 'Profile retrieved',
        'status': 'success',
        'data': user
    }), 200

@app.route('/api/admin/dashboard', methods=['GET'])
@token_required
@role_required(['admin'])
def admin_dashboard(user_id, role):
    """Admin-only endpoint"""
    return jsonify({
        'message': 'Admin dashboard data',
        'status': 'success',
        'data': {
            'users': len(USERS),
            'active_sessions': 5,
            'system_status': 'healthy'
        }
    }), 200

@app.route('/api/user/notifications', methods=['GET'])
@token_required
def get_notifications(user_id, role):
    """Protected endpoint to get user notifications"""
    # Sample notifications
    notifications = [
        {
            'id': 1,
            'title': 'Welcome to Tamkeen AI',
            'message': 'Welcome to our platform! Get started by completing your profile.',
            'createdAt': '2023-08-15T10:00:00Z',
            'type': 'system',
            'read': False
        },
        {
            'id': 2,
            'title': 'New job recommendation',
            'message': 'We found a job that matches your skills: Senior Developer at TechCorp',
            'createdAt': '2023-08-16T14:30:00Z',
            'type': 'job',
            'read': True
        }
    ]
    
    return jsonify({
        'message': 'Notifications retrieved',
        'status': 'success',
        'data': notifications
    }), 200

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'message': 'API is healthy',
        'status': 'success'
    }), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 