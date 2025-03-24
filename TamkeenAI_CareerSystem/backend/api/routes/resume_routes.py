"""
Resume Routes Module

This module provides API routes for resume upload, parsing, and management.
"""

import os
import logging
import uuid
from flask import Blueprint, request, jsonify, g, current_app
from werkzeug.utils import secure_filename
from datetime import datetime

# Import utilities
from backend.utils.date_utils import now
from backend.utils.cache_utils import cache_result

# Import database models
from backend.database.models import Resume, User

# Import core modules
from backend.core.profile_extractor import ProfileExtractor

# Import auth decorators
from backend.app import require_auth, require_role

# Import settings
from backend.config.settings import UPLOAD_FOLDER, ALLOWED_EXTENSIONS

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint
resume_blueprint = Blueprint('resume', __name__)

# Create profile extractor
profile_extractor = ProfileExtractor()


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@resume_blueprint.route('', methods=['POST'])
@require_auth
def upload_resume():
    """Upload a new resume"""
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file part'
            }), 400
        
        file = request.files['file']
        
        # Check if file was selected
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        # Check if file type is allowed
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': f'File type not allowed. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400
        
        # Create upload directory if it doesn't exist
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        # Save file with secure filename
        filename = secure_filename(file.filename)
        file_ext = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(file_path)
        
        # Extract text content (implementation depends on file type)
        content = profile_extractor.extract_text_from_file(file_path, file_ext)
        
        # Parse resume content
        parsed_data = profile_extractor.extract_profile_from_text(content)
        
        # Create resume record
        resume = Resume(
            user_id=g.user,
            filename=filename,
            file_path=unique_filename,
            content=content,
            parsed_data=parsed_data,
            status='processed',
            created_at=now().isoformat(),
            updated_at=now().isoformat()
        )
        
        if not resume.save():
            # Delete file if database save fails
            os.remove(file_path)
            return jsonify({
                'success': False,
                'error': 'Error saving resume'
            }), 500
        
        return jsonify({
            'success': True,
            'data': resume.to_dict(),
            'message': 'Resume uploaded and processed successfully'
        })
        
    except Exception as e:
        logger.error(f"Error uploading resume: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@resume_blueprint.route('', methods=['GET'])
@require_auth
def get_resumes():
    """Get user's resumes"""
    try:
        # Get resumes for current user
        resumes = Resume.find_by_user(g.user)
        
        # Get pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        # Pagination
        total = len(resumes)
        start = (page - 1) * limit
        end = start + limit
        paginated_resumes = resumes[start:end]
        
        # Prepare response
        resume_data = []
        for resume in paginated_resumes:
            resume_dict = resume.to_dict()
            
            # Don't return full content in listing
            if 'content' in resume_dict:
                resume_dict.pop('content')
            
            resume_data.append(resume_dict)
        
        return jsonify({
            'success': True,
            'data': {
                'resumes': resume_data,
                'pagination': {
                    'total': total,
                    'page': page,
                    'limit': limit,
                    'pages': (total + limit - 1) // limit
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting resumes: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@resume_blueprint.route('/<resume_id>', methods=['GET'])
@require_auth
def get_resume(resume_id):
    """Get resume by ID"""
    try:
        # Get resume
        resumes = Resume.find_by_id(resume_id)
        if not resumes:
            return jsonify({
                'success': False,
                'error': 'Resume not found'
            }), 404
        
        resume = resumes[0]
        
        # Check if user has permission
        if resume.user_id != g.user and g.user_role != 'admin':
            return jsonify({
                'success': False,
                'error': 'Permission denied'
            }), 403
        
        # Get query parameters
        include_content = request.args.get('include_content', 'false').lower() == 'true'
        
        # Prepare response
        resume_dict = resume.to_dict()
        
        # Remove content if not requested
        if not include_content and 'content' in resume_dict:
            resume_dict.pop('content')
        
        return jsonify({
            'success': True,
            'data': resume_dict
        })
        
    except Exception as e:
        logger.error(f"Error getting resume {resume_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@resume_blueprint.route('/<resume_id>', methods=['DELETE'])
@require_auth
def delete_resume(resume_id):
    """Delete resume"""
    try:
        # Get resume
        resumes = Resume.find_by_id(resume_id)
        if not resumes:
            return jsonify({
                'success': False,
                'error': 'Resume not found'
            }), 404
        
        resume = resumes[0]
        
        # Check if user has permission
        if resume.user_id != g.user and g.user_role != 'admin':
            return jsonify({
                'success': False,
                'error': 'Permission denied'
            }), 403
        
        # Delete file if it exists
        if resume.file_path:
            file_path = os.path.join(UPLOAD_FOLDER, resume.file_path)
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # Delete resume
        if not resume.delete():
            return jsonify({
                'success': False,
                'error': 'Error deleting resume'
            }), 500
        
        return jsonify({
            'success': True,
            'message': 'Resume deleted successfully'
        })
        
    except Exception as e:
        logger.error(f"Error deleting resume {resume_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@resume_blueprint.route('/<resume_id>/parse', methods=['POST'])
@require_auth
def parse_resume(resume_id):
    """Re-parse a resume"""
    try:
        # Get resume
        resumes = Resume.find_by_id(resume_id)
        if not resumes:
            return jsonify({
                'success': False,
                'error': 'Resume not found'
            }), 404
        
        resume = resumes[0]
        
        # Check if user has permission
        if resume.user_id != g.user and g.user_role != 'admin':
            return jsonify({
                'success': False,
                'error': 'Permission denied'
            }), 403
        
        # Parse resume content
        parsed_data = profile_extractor.extract_profile_from_text(resume.content)
        
        # Update resume
        resume.parsed_data = parsed_data
        resume.status = 'processed'
        resume.updated_at = now().isoformat()
        
        if not resume.save():
            return jsonify({
                'success': False,
                'error': 'Error updating resume'
            }), 500
        
        return jsonify({
            'success': True,
            'data': resume.to_dict(),
            'message': 'Resume parsed successfully'
        })
        
    except Exception as e:
        logger.error(f"Error parsing resume {resume_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@resume_blueprint.route('/<resume_id>/download', methods=['GET'])
@require_auth
def download_resume(resume_id):
    """Download resume file"""
    try:
        # Get resume
        resumes = Resume.find_by_id(resume_id)
        if not resumes:
            return jsonify({
                'success': False,
                'error': 'Resume not found'
            }), 404
        
        resume = resumes[0]
        
        # Check if user has permission
        if resume.user_id != g.user and g.user_role not in ['admin', 'recruiter']:
            return jsonify({
                'success': False,
                'error': 'Permission denied'
            }), 403
        
        # Check if file exists
        if not resume.file_path:
            return jsonify({
                'success': False,
                'error': 'File not found'
            }), 404
        
        file_path = os.path.join(UPLOAD_FOLDER, resume.file_path)
        if not os.path.exists(file_path):
            return jsonify({
                'success': False,
                'error': 'File not found'
            }), 404
        
        # Return file path for serving
        # In a real app, we would use send_file or redirect to a file server
        return jsonify({
            'success': True,
            'data': {
                'file_path': file_path,
                'filename': resume.filename
            }
        })
        
    except Exception as e:
        logger.error(f"Error downloading resume {resume_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@resume_blueprint.route('/<resume_id>/skills', methods=['GET'])
@require_auth
def get_resume_skills(resume_id):
    """Get skills from resume"""
    try:
        # Get resume
        resumes = Resume.find_by_id(resume_id)
        if not resumes:
            return jsonify({
                'success': False,
                'error': 'Resume not found'
            }), 404
        
        resume = resumes[0]
        
        # Check if user has permission
        if resume.user_id != g.user and g.user_role not in ['admin', 'recruiter']:
            return jsonify({
                'success': False,
                'error': 'Permission denied'
            }), 403
        
        # Get skills from parsed data
        skills = []
        parsed_data = resume.parsed_data
        
        if parsed_data and isinstance(parsed_data, dict):
            skills = parsed_data.get('skills', [])
        
        return jsonify({
            'success': True,
            'data': {
                'skills': skills
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting skills for resume {resume_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500 