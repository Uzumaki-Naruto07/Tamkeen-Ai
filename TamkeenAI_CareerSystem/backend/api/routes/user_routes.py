"""
User API Routes

This module provides API endpoints for user management, authentication, and profile operations.
"""

import os
import json
import logging
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime, timedelta

from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity,
    create_refresh_token, get_jwt
)

# Import models
from backend.database.models import User, UserActivity, JobApplication

# Import utilities
from backend.utils.api_utils import (
    api_response, error_response, validate_request, parse_query_params
)
from backend.utils.auth import (
    hash_password, verify_password, generate_reset_token,
    verify_reset_token, generate_verification_token, verify_verification_token
)

# Import settings
from backend.config.settings import JWT_EXPIRATION

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint
user_bp = Blueprint('user', __name__)


@user_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        # Validate request
        data = request.get_json()
        
        # Define validation rules
        rules = {
            'email': {'required': True, 'type': 'string', 'max_length': 255, 
                     'pattern': r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'},
            'password': {'required': True, 'type': 'string', 'min_length': 8, 'max_length': 100},
            'full_name': {'required': True, 'type': 'string', 'max_length': 100},
            'phone': {'required': False, 'type': 'string', 'max_length': 20},
            'location': {'required': False, 'type': 'string', 'max_length': 100}
        }
        
        valid, errors = validate_request(data, rules)
        
        if not valid:
            return error_response("Validation failed", 400, errors)
        
        # Check if user already exists
        existing_users = User.find_by_field('email', data['email'])
        
        if existing_users:
            return error_response("User with this email already exists", 409)
        
        # Hash password
        hashed_password = hash_password(data['password'])
        
        # Create user
        user = User(
            email=data['email'],
            password=hashed_password,
            full_name=data['full_name'],
            phone=data.get('phone', ''),
            location=data.get('location', ''),
            profile={},
            settings={},
            verified=False,
            status='active'
        )
        
        # Save user
        success = user.save()
        
        if not success:
            return error_response("Failed to create user", 500)
        
        # Generate verification token
        token = generate_verification_token(user.id)
        
        # Create JWT token
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        # Return response
        return api_response({
            'user_id': user.id,
            'email': user.email,
            'full_name': user.full_name,
            'access_token': access_token,
            'refresh_token': refresh_token,
            'verification_token': token
        }, message="User registered successfully")
    
    except Exception as e:
        logger.error(f"Error in register: {str(e)}")
        return error_response("Registration failed", 500)


@user_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        # Validate request
        data = request.get_json()
        
        # Define validation rules
        rules = {
            'email': {'required': True, 'type': 'string'},
            'password': {'required': True, 'type': 'string'}
        }
        
        valid, errors = validate_request(data, rules)
        
        if not valid:
            return error_response("Validation failed", 400, errors)
        
        # Find user
        users = User.find_by_field('email', data['email'])
        
        if not users:
            return error_response("Invalid email or password", 401)
        
        user = users[0]
        
        # Check password
        if not verify_password(data['password'], user.password):
            return error_response("Invalid email or password", 401)
        
        # Check status
        if user.status != 'active':
            return error_response("Account is not active", 403)
        
        # Check if profile exists
        profile = User.find_by_id(user_id)
        
        if not profile:
            return error_response("User not found", 404)
        
        # Update profile
        success = profile[0].save()
        
        if not success:
            return error_response("Failed to update profile", 500)
        
        return api_response(profile[0].to_dict(), message="Profile updated successfully")
    
    except Exception as e:
        logger.error(f"Error in update_profile: {str(e)}")
        return error_response("Failed to update profile", 500)


# Account settings

@user_bp.route('/settings', methods=['GET'])
@jwt_required()
def get_settings():
    """Get user settings"""
    try:
        # Get user ID from token
        user_id = get_jwt_identity()
        
        # Find user
        users = User.find_by_id(user_id)
        
        if not users:
            return error_response("User not found", 404)
        
        user = users[0]
        
        # Return settings
        return api_response(user.settings)
    
    except Exception as e:
        logger.error(f"Error in get_settings: {str(e)}")
        return error_response("Failed to get settings", 500)


@user_bp.route('/settings', methods=['PUT'])
@jwt_required()
def update_settings():
    """Update user settings"""
    try:
        # Get user ID from token
        user_id = get_jwt_identity()
        
        # Find user
        users = User.find_by_id(user_id)
        
        if not users:
            return error_response("User not found", 404)
        
        user = users[0]
        
        # Get settings from request
        data = request.get_json()
        
        # Validate settings (basic validation)
        if not isinstance(data, dict):
            return error_response("Invalid settings format", 400)
        
        # Update settings
        user.settings = data
        
        # Save user
        success = user.save()
        
        if not success:
            return error_response("Failed to update settings", 500)
        
        return api_response(user.settings, message="Settings updated successfully")
    
    except Exception as e:
        logger.error(f"Error in update_settings: {str(e)}")
        return error_response("Failed to update settings", 500)


# User activity

@user_bp.route('/activity', methods=['GET'])
@jwt_required()
def get_activity():
    """Get user activity history"""
    try:
        # Get user ID from token
        user_id = get_jwt_identity()
        
        # Get query parameters
        params = parse_query_params(request)
        limit = params.get('limit', 20)
        offset = params.get('offset', 0)
        
        # Get user activity
        activities = UserActivity.find_by_user_id(user_id, limit)
        
        # Convert to dicts
        activity_dicts = [activity.to_dict() for activity in activities]
        
        return api_response(activity_dicts)
    
    except Exception as e:
        logger.error(f"Error in get_activity: {str(e)}")
        return error_response("Failed to get activity", 500)


# User applications

@user_bp.route('/applications', methods=['GET'])
@jwt_required()
def get_applications():
    """Get user job applications"""
    try:
        # Get user ID from token
        user_id = get_jwt_identity()
        
        # Get applications
        applications = JobApplication.find_by_user_id(user_id)
        
        # Convert to dicts
        application_dicts = [application.to_dict() for application in applications]
        
        return api_response(application_dicts)
    
    except Exception as e:
        logger.error(f"Error in get_applications: {str(e)}")
        return error_response("Failed to get applications", 500) 