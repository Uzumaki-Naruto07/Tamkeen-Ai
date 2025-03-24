"""
Authentication Routes Module

This module provides API routes for user authentication and authorization.
"""

import logging
from datetime import datetime
from flask import Blueprint, request, jsonify, g

# Import utilities
from backend.utils.auth import (
    hash_password, verify_password, validate_password_strength,
    generate_token, decode_token
)

# Import database models
from backend.database.models import User, UserActivity

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint
auth_blueprint = Blueprint('auth', __name__)


@auth_blueprint.route('/login', methods=['POST'])
def login():
    """Login endpoint"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({
                'success': False,
                'error': 'Email and password are required'
            }), 400
        
        users = User.find_by_email(data.get('email'))
        
        if not users or not verify_password(users[0].password, data.get('password')):
            return jsonify({
                'success': False,
                'error': 'Invalid email or password'
            }), 401
        
        user = users[0]
        access_token = generate_token(user.id, 'access')
        refresh_token = generate_token(user.id, 'refresh')
        
        UserActivity.record_activity(user.id, 'login', {
            'timestamp': datetime.now().isoformat(),
            'ip': request.remote_addr
        })
        
        return jsonify({
            'success': True,
            'data': {
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name,
                    'role': user.role
                },
                'tokens': {
                    'access_token': access_token,
                    'refresh_token': refresh_token
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Error in login: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@auth_blueprint.route('/register', methods=['POST'])
def register():
    """Register endpoint"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password') or not data.get('name'):
            return jsonify({
                'success': False,
                'error': 'Email, password, and name are required'
            }), 400
        
        existing_users = User.find_by_email(data.get('email'))
        if existing_users:
            return jsonify({
                'success': False,
                'error': 'Email already exists'
            }), 400
        
        is_valid, error_message = validate_password_strength(data.get('password'))
        if not is_valid:
            return jsonify({
                'success': False,
                'error': error_message
            }), 400
        
        user = User(
            email=data.get('email'),
            password=hash_password(data.get('password')),
            name=data.get('name'),
            role='user',
            status='active'
        )
        
        if not user.save():
            return jsonify({
                'success': False,
                'error': 'Error creating user'
            }), 500
        
        access_token = generate_token(user.id, 'access')
        refresh_token = generate_token(user.id, 'refresh')
        
        return jsonify({
            'success': True,
            'data': {
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name,
                    'role': user.role
                },
                'tokens': {
                    'access_token': access_token,
                    'refresh_token': refresh_token
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Error in register: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@auth_blueprint.route('/refresh', methods=['POST'])
def refresh():
    """Refresh token endpoint"""
    try:
        data = request.get_json()
        
        if not data or not data.get('refresh_token'):
            return jsonify({
                'success': False,
                'error': 'Refresh token is required'
            }), 400
        
        payload = decode_token(data.get('refresh_token'))
        if not payload or payload.get('type') != 'refresh':
            return jsonify({
                'success': False,
                'error': 'Invalid refresh token'
            }), 401
        
        access_token = generate_token(payload.get('sub'), 'access')
        
        return jsonify({
            'success': True,
            'data': {
                'access_token': access_token
            }
        })
        
    except Exception as e:
        logger.error(f"Error in refresh: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@auth_blueprint.route('/logout', methods=['POST'])
def logout():
    """Logout endpoint"""
    try:
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            payload = decode_token(token)
            
            if payload and 'sub' in payload:
                UserActivity.record_activity(payload['sub'], 'logout', {
                    'timestamp': datetime.now().isoformat()
                })
        
        return jsonify({
            'success': True,
            'message': 'Logged out'
        })
        
    except Exception as e:
        logger.error(f"Error in logout: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@auth_blueprint.route('/password', methods=['PUT'])
def change_password():
    """Change password endpoint"""
    try:
        # Only authenticated users can change password
        if not g.user:
            return jsonify({
                'success': False,
                'error': 'Authentication required'
            }), 401
        
        data = request.get_json()
        if not data or not data.get('current_password') or not data.get('new_password'):
            return jsonify({
                'success': False,
                'error': 'Current password and new password are required'
            }), 400
        
        users = User.find_by_id(g.user)
        if not users:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        user = users[0]
        if not verify_password(user.password, data.get('current_password')):
            return jsonify({
                'success': False,
                'error': 'Current password is incorrect'
            }), 401
        
        is_valid, error_message = validate_password_strength(data.get('new_password'))
        if not is_valid:
            return jsonify({
                'success': False,
                'error': error_message
            }), 400
        
        user.password = hash_password(data.get('new_password'))
        user.save()
        
        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        })
        
    except Exception as e:
        logger.error(f"Error in change_password: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500 