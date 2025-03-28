"""
User Routes Module

This module provides API routes for user management and profiles.
"""

import logging
from flask import Blueprint, request, jsonify, g
from api.utils.auth import hash_password, validate_password_strength
from api.database.models import User, UserActivity
from api.utils.date_utils import now
from api.app import require_auth, require_role

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint
user_blueprint = Blueprint('user', __name__)


@user_blueprint.route('', methods=['GET'])
@require_auth
@require_role(['admin'])
def get_users():
    """Get all users (admin only)"""
    try:
        # Get query params
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        status = request.args.get('status')
        role = request.args.get('role')
        
        # Build query
        conditions = {}
        if status:
            conditions['status'] = status
        if role:
            conditions['role'] = role
        
        # Get users
        users = User.find_by_conditions(conditions)
        
        # Simple pagination
        total = len(users)
        start = (page - 1) * limit
        end = start + limit
        paginated_users = users[start:end]
        
        # Convert to dict and remove sensitive data
        user_data = []
        for user in paginated_users:
            user_dict = user.to_dict()
            user_dict.pop('password', None)
            user_data.append(user_dict)
        
        return jsonify({
            'success': True,
            'data': {
                'users': user_data,
                'pagination': {
                    'total': total,
                    'page': page,
                    'limit': limit,
                    'pages': (total + limit - 1) // limit
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting users: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@user_blueprint.route('/<user_id>', methods=['GET'])
@require_auth
def get_user(user_id):
    """Get user by ID"""
    try:
        # Check permissions
        if g.user != user_id and g.user_role != 'admin':
            return jsonify({
                'success': False,
                'error': 'Permission denied'
            }), 403
        
        # Get user
        users = User.find_by_id(user_id)
        if not users:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        # Convert to dict and remove sensitive data
        user_dict = users[0].to_dict()
        user_dict.pop('password', None)
        
        return jsonify({
            'success': True,
            'data': user_dict
        })
        
    except Exception as e:
        logger.error(f"Error getting user {user_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@user_blueprint.route('/<user_id>', methods=['PUT'])
@require_auth
def update_user(user_id):
    """Update user"""
    try:
        # Check permissions
        if g.user != user_id and g.user_role != 'admin':
            return jsonify({
                'success': False,
                'error': 'Permission denied'
            }), 403
        
        # Get user
        users = User.find_by_id(user_id)
        if not users:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        user = users[0]
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Prepare update data
        update_data = {}
        
        # Update name
        if 'name' in data:
            update_data['name'] = data['name']
        
        # Update profile
        if 'profile' in data:
            update_data['profile'] = data['profile']
        
        # Update settings
        if 'settings' in data:
            update_data['settings'] = data['settings']
        
        # Update role (admin only)
        if 'role' in data and g.user_role == 'admin':
            update_data['role'] = data['role']
        
        # Update status (admin only)
        if 'status' in data and g.user_role == 'admin':
            update_data['status'] = data['status']
        
        # Update timestamp
        update_data['updated_at'] = now().isoformat()
        
        # Update user
        for key, value in update_data.items():
            setattr(user, key, value)
        
        if not user.save():
            return jsonify({
                'success': False,
                'error': 'Error updating user'
            }), 500
        
        # Record activity
        UserActivity.record_activity(user.id, 'profile_update', {
            'updated_fields': list(update_data.keys())
        })
        
        # Return updated user
        user_dict = user.to_dict()
        user_dict.pop('password', None)
        
        return jsonify({
            'success': True,
            'data': user_dict
        })
        
    except Exception as e:
        logger.error(f"Error updating user {user_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@user_blueprint.route('/<user_id>', methods=['DELETE'])
@require_auth
def delete_user(user_id):
    """Delete user"""
    try:
        # Check permissions
        if g.user != user_id and g.user_role != 'admin':
            return jsonify({
                'success': False,
                'error': 'Permission denied'
            }), 403
        
        # Get user
        users = User.find_by_id(user_id)
        if not users:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        user = users[0]
        
        # Delete user
        if not user.delete():
            return jsonify({
                'success': False,
                'error': 'Error deleting user'
            }), 500
        
        return jsonify({
            'success': True,
            'message': 'User deleted successfully'
        })
        
    except Exception as e:
        logger.error(f"Error deleting user {user_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@user_blueprint.route('/<user_id>/profile', methods=['GET'])
@require_auth
def get_profile(user_id):
    """Get user profile"""
    try:
        # Check permissions
        if g.user != user_id and g.user_role != 'admin':
            return jsonify({
                'success': False,
                'error': 'Permission denied'
            }), 403
        
        # Get user
        users = User.find_by_id(user_id)
        if not users:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        user = users[0]
        
        # Return profile data
        return jsonify({
            'success': True,
            'data': user.profile or {}
        })
        
    except Exception as e:
        logger.error(f"Error getting profile for user {user_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@user_blueprint.route('/<user_id>/profile', methods=['PUT'])
@require_auth
def update_profile(user_id):
    """Update user profile"""
    try:
        # Check permissions
        if g.user != user_id and g.user_role != 'admin':
            return jsonify({
                'success': False,
                'error': 'Permission denied'
            }), 403
        
        # Get user
        users = User.find_by_id(user_id)
        if not users:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        user = users[0]
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Update profile
        user.profile = data
        user.updated_at = now().isoformat()
        
        if not user.save():
            return jsonify({
                'success': False,
                'error': 'Error updating profile'
            }), 500
        
        # Record activity
        UserActivity.record_activity(user.id, 'profile_update', {
            'updated_fields': list(data.keys())
        })
        
        return jsonify({
            'success': True,
            'data': user.profile
        })
        
    except Exception as e:
        logger.error(f"Error updating profile for user {user_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@user_blueprint.route('/<user_id>/activity', methods=['GET'])
@require_auth
def get_activity(user_id):
    """Get user activity"""
    try:
        # Check permissions
        if g.user != user_id and g.user_role != 'admin':
            return jsonify({
                'success': False,
                'error': 'Permission denied'
            }), 403
        
        # Get activity
        activities = UserActivity.find_by_user(user_id)
        
        # Get query params
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        
        # Simple pagination
        total = len(activities)
        start = (page - 1) * limit
        end = start + limit
        paginated_activities = activities[start:end]
        
        # Convert to dict
        activity_data = [activity.to_dict() for activity in paginated_activities]
        
        return jsonify({
            'success': True,
            'data': {
                'activities': activity_data,
                'pagination': {
                    'total': total,
                    'page': page,
                    'limit': limit,
                    'pages': (total + limit - 1) // limit
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting activity for user {user_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500 