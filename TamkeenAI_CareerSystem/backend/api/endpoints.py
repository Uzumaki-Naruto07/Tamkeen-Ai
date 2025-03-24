"""
API Endpoints Module

This module defines the API endpoints for the Tamkeen AI Career Intelligence System.
"""

import os
import json
import uuid
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime
import logging

from flask import Blueprint, request, jsonify, current_app, g, send_file
from flask_jwt_extended import (
    jwt_required, create_access_token, create_refresh_token,
    get_jwt_identity, verify_jwt_in_request
)
from werkzeug.utils import secure_filename

# Import database models
from backend.database.models import User, Resume, Job, JobApplication, UserSkill, Career

# Import core modules
from backend.core.user_management import (
    register_user, update_profile, update_user_settings,
    get_user_data, delete_account
)
from backend.core.resume_parser import (
    process_resume_upload, parse_resume, extract_text_from_resume,
    get_resume_data, get_resume_versions, compare_resume_versions
)
from backend.core.job_matching import (
    match_resume_to_job, generate_job_recommendations, apply_to_job
)
from backend.core.career_assessment import (
    get_career_options, assess_career_compatibility,
    perform_skills_gap_analysis, generate_career_path, get_user_assessments
)

# Import utilities
from backend.utils.auth import (
    validate_email, validate_password, authenticate_user,
    generate_password_reset_token, verify_password_reset_token
)
from backend.utils.response import (
    api_response, error_response, paginated_response,
    success_response, unauthorized_response, forbidden_response
)
from backend.utils.security import (
    sanitize_input, validate_json_request, 
    validate_request_args, validate_form_data
)
from backend.utils.file_utils import (
    allowed_file, save_uploaded_file, delete_file, get_file_url
)

# Import settings
from backend.config.settings import API_PREFIX

# Setup logger
logger = logging.getLogger(__name__)


def get_api_blueprint() -> Blueprint:
    """
    Create and configure the API blueprint
    
    Returns:
        Blueprint: Flask blueprint with API routes
    """
    api_bp = Blueprint('api', __name__, url_prefix=API_PREFIX)
    
    # -------------------------------------------------------------------------
    # Authentication Routes
    # -------------------------------------------------------------------------
    
    @api_bp.route('/auth/register', methods=['POST'])
    def register():
        """Register a new user"""
        # Validate request
        is_valid, data, error = validate_json_request()
        if not is_valid:
            return error_response(error)
        
        # Check required fields
        required_fields = ['email', 'password', 'username']
        for field in required_fields:
            if field not in data:
                return error_response(f"Missing required field: {field}")
        
        # Register user
        success, user, message = register_user(data)
        
        if not success:
            return error_response(message)
        
        # Generate tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return api_response({
            "message": "User registered successfully",
            "user": user.to_dict(),
            "access_token": access_token,
            "refresh_token": refresh_token
        })
    
    @api_bp.route('/auth/login', methods=['POST'])
    def login():
        """User login"""
        # Validate request
        is_valid, data, error = validate_json_request()
        if not is_valid:
            return error_response(error)
        
        # Check required fields
        if 'email' not in data or 'password' not in data:
            return error_response("Email and password are required")
        
        # Authenticate user
        success, user, message = authenticate_user(data['email'], data['password'])
        
        if not success:
            return unauthorized_response(message)
        
        # Generate tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return api_response({
            "message": "Login successful",
            "user": user.to_dict(),
            "access_token": access_token,
            "refresh_token": refresh_token
        })
    
    @api_bp.route('/auth/refresh', methods=['POST'])
    @jwt_required(refresh=True)
    def refresh_token():
        """Refresh access token"""
        current_user_id = get_jwt_identity()
        
        # Get user
        user = User.find_by_id(current_user_id)
        if not user:
            return unauthorized_response("Invalid user")
        
        # Generate new access token
        access_token = create_access_token(identity=current_user_id)
        
        return api_response({
            "access_token": access_token
        })
    
    @api_bp.route('/auth/password-reset/request', methods=['POST'])
    def request_password_reset():
        """Request password reset"""
        # Validate request
        is_valid, data, error = validate_json_request()
        if not is_valid:
            return error_response(error)
        
        # Check required fields
        if 'email' not in data:
            return error_response("Email is required")
        
        # Generate password reset token
        token = generate_password_reset_token(data['email'])
        
        return api_response({
            "message": "Password reset token generated",
            "token": token
        })
    
    @api_bp.route('/jobs/recommend', methods=['GET'])
    @jwt_required()
    def recommend_jobs():
        """Get job recommendations"""
        current_user_id = get_jwt_identity()
        
        # Get resume ID from query parameters
        resume_id = request.args.get('resume_id')
        
        # Get limit from query parameters
        try:
            limit = int(request.args.get('limit', 10))
        except ValueError:
            limit = 10
        
        # Generate recommendations
        recommendations = generate_job_recommendations(current_user_id, resume_id, limit)
        
        return api_response({
            "recommendations": recommendations
        })
    
    @api_bp.route('/jobs/<job_id>/apply', methods=['POST'])
    @jwt_required()
    def apply_job(job_id):
        """Apply to a job"""
        current_user_id = get_jwt_identity()
        
        # Validate request
        is_valid, data, error = validate_json_request()
        if not is_valid:
            return error_response(error)
        
        # Check if resume ID is provided
        if 'resume_id' not in data:
            return error_response("Resume ID is required")
        
        resume_id = data['resume_id']
        cover_letter = data.get('cover_letter')
        
        # Apply to job
        success, message = apply_to_job(current_user_id, job_id, resume_id, cover_letter)
        
        if not success:
            return error_response(message)
        
        return success_response("Application submitted successfully")
    
    @api_bp.route('/applications', methods=['GET'])
    @jwt_required()
    def get_applications():
        """Get user's job applications"""
        current_user_id = get_jwt_identity()
        
        # Get pagination parameters
        try:
            page = int(request.args.get('page', 1))
            per_page = int(request.args.get('per_page', 10))
        except ValueError:
            page = 1
            per_page = 10
        
        # Get status filter
        status = request.args.get('status')
        
        # Get applications
        applications = JobApplication.find_by_user_id(
            current_user_id, 
            status=status,
            page=page,
            per_page=per_page
        )
        
        # Get total count
        count = JobApplication.count_by_user_id(current_user_id, status=status)
        
        # Format response
        return paginated_response(
            [app.to_dict() for app in applications],
            page,
            per_page,
            count,
            'applications'
        )
    
    # -------------------------------------------------------------------------
    # Career Assessment Routes
    # -------------------------------------------------------------------------
    
    @api_bp.route('/careers', methods=['GET'])
    def get_careers():
        """Get available career options"""
        careers = get_career_options()
        
        return api_response({
            "careers": careers
        })
    
    @api_bp.route('/careers/compatibility', methods=['GET'])
    @jwt_required()
    def career_compatibility():
        """Assess career compatibility"""
        current_user_id = get_jwt_identity()
        
        # Get resume ID from query parameters
        resume_id = request.args.get('resume_id')
        
        # Get limit from query parameters
        try:
            limit = int(request.args.get('limit', 5))
        except ValueError:
            limit = 5
        
        # Assess compatibility
        result = assess_career_compatibility(current_user_id, resume_id, limit)
        
        return api_response(result)
    
    @api_bp.route('/careers/<career_id>/skills-gap', methods=['GET'])
    @jwt_required()
    def skills_gap_analysis(career_id):
        """Perform skills gap analysis"""
        current_user_id = get_jwt_identity()
        
        # Get resume ID from query parameters
        resume_id = request.args.get('resume_id')
        
        # Perform analysis
        result = perform_skills_gap_analysis(current_user_id, career_id, resume_id)
        
        return api_response(result)
    
    @api_bp.route('/careers/<career_id>/path', methods=['GET'])
    @jwt_required()
    def career_path(career_id):
        """Generate career path"""
        current_user_id = get_jwt_identity()
        
        # Generate path
        result = generate_career_path(current_user_id, career_id)
        
        return api_response(result)
    
    @api_bp.route('/assessments', methods=['GET'])
    @jwt_required()
    def get_assessments():
        """Get user's career assessments"""
        current_user_id = get_jwt_identity()
        
        # Get assessments
        assessments = get_user_assessments(current_user_id)
        
        return api_response({
            "assessments": assessments
        })
    
    # -------------------------------------------------------------------------
    # Utility Routes
    # -------------------------------------------------------------------------
    
    @api_bp.route('/health', methods=['GET'])
    def health_check():
        """API health check"""
        return api_response({
            "status": "online",
            "timestamp": datetime.now().isoformat()
        })
    
    return api_bp 