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
from bson.objectid import ObjectId

# Import models
from api.database.models import User, UserActivity, JobApplication

# Import utilities
from api.utils.api_utils import (
    api_response, error_response, validate_request, parse_query_params
)
from api.utils.auth import (
    hash_password, verify_password, generate_token, generate_reset_token,
    verify_reset_token, generate_verification_token, verify_verification_token,
    auth_required, get_current_user
)

# Import core functionality
from api.core.job_matching import JobMatcher
from api.core.user_profiler import UserProfiler

# Import database
from api.database.connector import user_collection, skill_collection

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
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Invalid request data'
            }), 400
        
        # Check required fields
        required_fields = ['email', 'password', 'full_name']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Check if user already exists
        existing_user = User.find_by_email(data['email'])
        
        if existing_user:
            return jsonify({
                'success': False,
                'error': 'User with this email already exists'
            }), 409
        
        # Hash password
        hashed_password = hash_password(data['password'])
        
        # Create user
        user = User(
            email=data['email'],
            password=hashed_password,
            name=data['full_name'],
            role='user',
            profile={
                'phone': data.get('phone', ''),
                'location': data.get('location', ''),
                'bio': data.get('bio', '')
            }
        )
        
        # Save user
        success = user.save()
        
        if not success:
            return jsonify({
                'success': False,
                'error': 'Failed to create user'
            }), 500
        
        # Generate token
        token = generate_token(user.id, 24, os.getenv('JWT_SECRET_KEY', 'dev-secret-key'))
        
        # Return response
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'data': {
                'user_id': user.id,
                'email': user.email,
                'name': user.name,
                'token': token
            }
        })
    
    except Exception as e:
        logger.error(f"Error in register: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Registration failed'
        }), 500


@user_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        # Validate request
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Invalid request data'
            }), 400
        
        # Check required fields
        required_fields = ['email', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Find user
        user = User.find_by_email(data['email'])
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'Invalid email or password'
            }), 401
        
        # Check password
        if not verify_password(data['password'], user.password):
            return jsonify({
                'success': False,
                'error': 'Invalid email or password'
            }), 401
        
        # Generate token
        token = generate_token(user.id, 24, os.getenv('JWT_SECRET_KEY', 'dev-secret-key'))
        
        # Create activity log
        activity = UserActivity(
            user_id=user.id,
            activity_type='login',
            activity_data={
                'ip_address': request.remote_addr,
                'user_agent': request.user_agent.string if request.user_agent else None
            }
        )
        activity.save()
        
        # Return response
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': {
                'user_id': user.id,
                'email': user.email,
                'name': user.name,
                'token': token
            }
        })
    
    except Exception as e:
        logger.error(f"Error in login: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Login failed'
        }), 500


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


@user_bp.route('/skills/recommendations', methods=['GET'])
@jwt_required()
def get_skill_recommendations():
    """
    Get skill recommendations for the authenticated user
    """
    try:
        # Get current user from auth middleware
        current_user = get_current_user(request)
        user_id = str(current_user["_id"])  # Convert ObjectId to string if needed
        # Get user profile from database
        user_profile = user_collection.find_one({"_id": ObjectId(user_id)})
        
        if not user_profile:
            return error_response("User profile not found", 404)
        # Get target role and industry from request
        target_role = request.args.get('target_role', user_profile.get("target_role", ""))
        industry = request.args.get('industry', user_profile.get("industry", ""))
        
        # Get skill recommendations
        job_matcher = JobMatcher()
        recommendations = job_matcher.get_skill_recommendations(
            user_profile.get("skills", []),
            target_role,
            industry
        )
        
        return api_response(recommendations)
        
    except Exception as e:
        logger.error(f"Error getting skill recommendations: {str(e)}")
        return error_response("Failed to get skill recommendations", 500)


@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    """Get user profile information"""
    try:
        # Get user ID from token
        user_id = get_jwt_identity()
        
        # Find user
        users = User.find_by_id(user_id)
        
        if not users:
            return error_response("User not found", 404)
        
        user = users[0]
        
        # Return user profile
        return api_response({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "profile": user.profile,
            "settings": user.settings,
            "progress": {
                "profile_completion": calculate_profile_completion(user),
                "resume_score": get_latest_resume_score(user_id),
                "skill_gap": get_user_skill_gap(user_id)
            }
        })
    
    except Exception as e:
        logger.error(f"Error in get_user_profile: {str(e)}")
        return error_response("Failed to get user profile", 500)


@user_bp.route('/profile', methods=['POST', 'PUT'])
@jwt_required()
def update_user_profile():
    """Update user profile information"""
    try:
        # Get user ID from token
        user_id = get_jwt_identity()
        
        # Find user
        users = User.find_by_id(user_id)
        
        if not users:
            return error_response("User not found", 404)
        
        user = users[0]
        
        # Get profile data from request
        data = request.get_json()
        
        if not data:
            return error_response("Invalid request data", 400)
        
        # Update allowed profile fields
        allowed_fields = [
            'firstName', 'lastName', 'phone', 'location', 'bio', 
            'currentTitle', 'company', 'industry', 'yearsOfExperience', 
            'skills', 'education', 'languages', 'jobTypes', 
            'salaryExpectation', 'willingToRelocate', 'remotePreference',
            'shortTermGoals', 'longTermGoals', 'interestedRoles', 
            'interestedIndustries', 'profilePicture', 'careerGoal',
            'skillLevel', 'educationLevel', 'interests', 'languagePreference',
            'gender'
        ]
        
        # Initialize profile if it doesn't exist
        if not user.profile:
            user.profile = {}
        
        # Update profile fields
        for field in allowed_fields:
            if field in data:
                user.profile[field] = data[field]
        
        # Save user
        success = user.save()
        
        if not success:
            return error_response("Failed to update user profile", 500)
        
        # Create activity log
        activity = UserActivity(
            user_id=user.id,
            activity_type='update_profile',
            activity_data={
                'updated_fields': list(data.keys())
            }
        )
        activity.save()
        
        # Check if this is a new profile or a significant update
        is_significant_update = 'skills' in data or 'careerGoal' in data
        
        # If it's a significant update, trigger the user profiler
        if is_significant_update:
            # Run user profiling in the background
            try:
                profiler = UserProfiler(user_id)
                profiler.update_career_recommendations()
            except Exception as e:
                logger.error(f"Error updating career recommendations: {str(e)}")
        
        # Return updated profile with completion percentage
        return api_response({
            "message": "Profile updated successfully",
            "profile": user.profile,
            "completion": calculate_profile_completion(user)
        })
    
    except Exception as e:
        logger.error(f"Error in update_user_profile: {str(e)}")
        return error_response(f"Failed to update user profile: {str(e)}", 500)


@user_bp.route('/profile/progress', methods=['GET'])
@jwt_required()
def get_profile_progress():
    """Get user profile completion progress"""
    try:
        # Get user ID from token
        user_id = get_jwt_identity()
        
        # Find user
        users = User.find_by_id(user_id)
        
        if not users:
            return error_response("User not found", 404)
        
        user = users[0]
        
        # Calculate profile completion
        completion = calculate_profile_completion(user)
        
        # Get missing fields
        missing_fields = get_missing_profile_fields(user)
        
        # Return progress
        return api_response({
            "completion": completion,
            "missing_fields": missing_fields,
            "next_steps": generate_next_steps(user, missing_fields)
        })
    
    except Exception as e:
        logger.error(f"Error in get_profile_progress: {str(e)}")
        return error_response("Failed to get profile progress", 500)


# Helper functions

def calculate_profile_completion(user):
    """Calculate user profile completion percentage"""
    if not user.profile:
        return 0
    
    # Define required profile fields
    required_fields = [
        'firstName', 'lastName', 'skills', 'careerGoal',
        'education', 'interests', 'languagePreference'
    ]
    
    # Calculate completion
    if len(required_fields) == 0:
        return 100
    
    filled_fields = sum(1 for field in required_fields if field in user.profile and user.profile[field])
    return round((filled_fields / len(required_fields)) * 100)


def get_missing_profile_fields(user):
    """Get missing profile fields"""
    if not user.profile:
        return ["All profile information"]
    
    # Define required profile fields
    required_fields = [
        'firstName', 'lastName', 'skills', 'careerGoal',
        'education', 'interests', 'languagePreference'
    ]
    
    # Get missing fields
    missing = []
    for field in required_fields:
        if field not in user.profile or not user.profile[field]:
            missing.append(field)
    
    return missing


def generate_next_steps(user, missing_fields):
    """Generate next steps for user profile completion"""
    if not missing_fields:
        return ["Your profile is complete! Time to explore career options."]
    
    steps = []
    for field in missing_fields:
        if field == 'firstName' or field == 'lastName':
            steps.append("Complete your personal information")
        elif field == 'skills':
            steps.append("Add your skills to help us match you with opportunities")
        elif field == 'careerGoal':
            steps.append("Define your career goal to get targeted recommendations")
        elif field == 'education':
            steps.append("Add your education history")
        elif field == 'interests':
            steps.append("Share your interests to personalize your experience")
        elif field == 'languagePreference':
            steps.append("Set your preferred language")
    
    return steps


def get_latest_resume_score(user_id):
    """Get the latest resume score for a user"""
    # This would be implemented to fetch from the resume service
    # For now, return a placeholder score
    return {
        "score": 75,
        "last_updated": datetime.now().isoformat()
    }


def get_user_skill_gap(user_id):
    """Get the skill gap for a user"""
    # This would be implemented to fetch from the skills service
    # For now, return placeholder data
    return {
        "top_missing_skills": ["Cloud Architecture", "Docker", "Kubernetes"],
        "gap_percentage": 25
    } 