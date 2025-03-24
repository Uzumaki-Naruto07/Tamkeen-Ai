"""
Job Routes Module

This module provides API routes for job search, recommendations, and applications.
"""

import logging
from flask import Blueprint, request, jsonify, g
from datetime import datetime

# Import utilities
from backend.utils.date_utils import now

# Import database models
from backend.database.models import Job, JobApplication, User, Resume

# Import core modules
from backend.core.job_matching import JobMatcher

# Import auth decorators
from backend.app import require_auth, require_role

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint
job_blueprint = Blueprint('job', __name__)

# Create job matcher
job_matcher = JobMatcher()


@job_blueprint.route('', methods=['GET'])
def search_jobs():
    """Search for jobs"""
    try:
        # Get query params
        query = request.args.get('q', '')
        location = request.args.get('location', '')
        job_type = request.args.get('type', '')
        company = request.args.get('company', '')
        industry = request.args.get('industry', '')
        experience = request.args.get('experience', '')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        sort_by = request.args.get('sort_by', 'date')
        sort_order = request.args.get('sort_order', 'desc')
        
        # Build filters dictionary
        filters = {}
        if location:
            filters['location'] = location
        if job_type:
            filters['job_type'] = job_type
        if company:
            filters['company'] = company
        if industry:
            filters['industry'] = industry
        if experience:
            filters['experience'] = experience
        
        # Search jobs
        jobs, total = job_matcher.search_jobs(
            query=query,
            filters=filters,
            page=page,
            limit=limit,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        return jsonify({
            'success': True,
            'data': {
                'jobs': jobs,
                'pagination': {
                    'total': total,
                    'page': page,
                    'limit': limit,
                    'pages': (total + limit - 1) // limit
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Error searching jobs: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@job_blueprint.route('/<job_id>', methods=['GET'])
def get_job(job_id):
    """Get job details by ID"""
    try:
        # Get job by ID
        jobs = Job.find_by_id(job_id)
        
        if not jobs:
            return jsonify({
                'success': False,
                'error': 'Job not found'
            }), 404
        
        job = jobs[0]
        
        # Check if job is active
        if job.status != 'active':
            return jsonify({
                'success': False,
                'error': 'Job is no longer active'
            }), 404
        
        # Track job view if user is authenticated
        if hasattr(g, 'user') and g.user:
            # In a real app, we would track this as a user activity
            pass
        
        return jsonify({
            'success': True,
            'data': job.to_dict()
        })
        
    except Exception as e:
        logger.error(f"Error getting job {job_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@job_blueprint.route('/recommended', methods=['GET'])
@require_auth
def get_recommended_jobs():
    """Get recommended jobs for authenticated user"""
    try:
        # Get user's resume
        resumes = Resume.find_by_user(g.user)
        resume_data = None
        
        if resumes:
            # Use the latest resume
            latest_resume = max(resumes, key=lambda x: x.created_at if hasattr(x, 'created_at') else '')
            resume_data = latest_resume.parsed_data
        
        # Get pagination params
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        # Get recommended jobs
        recommendations, total = job_matcher.get_recommended_jobs(
            user_id=g.user,
            resume_data=resume_data,
            page=page,
            limit=limit
        )
        
        return jsonify({
            'success': True,
            'data': {
                'jobs': recommendations,
                'pagination': {
                    'total': total,
                    'page': page,
                    'limit': limit,
                    'pages': (total + limit - 1) // limit
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting recommended jobs: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@job_blueprint.route('/<job_id>/apply', methods=['POST'])
@require_auth
def apply_for_job(job_id):
    """Apply for job"""
    try:
        # Check if job exists and is active
        jobs = Job.find_by_id(job_id)
        if not jobs:
            return jsonify({
                'success': False,
                'error': 'Job not found'
            }), 404
        
        job = jobs[0]
        if job.status != 'active':
            return jsonify({
                'success': False,
                'error': 'Job is no longer active'
            }), 400
        
        # Check if already applied
        existing_apps = JobApplication.find_by_user_and_job(g.user, job_id)
        if existing_apps:
            return jsonify({
                'success': False,
                'error': 'You have already applied for this job'
            }), 400
        
        # Get request data
        data = request.get_json() or {}
        
        # Get resume ID
        resume_id = data.get('resume_id')
        if not resume_id:
            # Get user's resumes
            resumes = Resume.find_by_user(g.user)
            if not resumes:
                return jsonify({
                    'success': False,
                    'error': 'No resume found. Please upload a resume first.'
                }), 400
            
            # Use the latest resume
            latest_resume = max(resumes, key=lambda x: x.created_at if hasattr(x, 'created_at') else '')
            resume_id = latest_resume.id
        
        # Create application
        application = JobApplication(
            user_id=g.user,
            job_id=job_id,
            resume_id=resume_id,
            cover_letter=data.get('cover_letter', ''),
            status='applied',
            application_date=now().isoformat(),
            created_at=now().isoformat(),
            updated_at=now().isoformat()
        )
        
        if not application.save():
            return jsonify({
                'success': False,
                'error': 'Error saving application'
            }), 500
        
        return jsonify({
            'success': True,
            'data': application.to_dict(),
            'message': 'Application submitted successfully'
        })
        
    except Exception as e:
        logger.error(f"Error applying for job {job_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@job_blueprint.route('/applications', methods=['GET'])
@require_auth
def get_applications():
    """Get user's job applications"""
    try:
        # Get applications
        applications = JobApplication.find_by_user(g.user)
        
        # Get pagination params
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        # Pagination
        total = len(applications)
        start = (page - 1) * limit
        end = start + limit
        paginated_applications = applications[start:end]
        
        # Get job details for each application
        application_data = []
        for app in paginated_applications:
            app_dict = app.to_dict()
            
            # Get job details
            jobs = Job.find_by_id(app.job_id)
            if jobs:
                app_dict['job'] = jobs[0].to_dict()
            
            application_data.append(app_dict)
        
        return jsonify({
            'success': True,
            'data': {
                'applications': application_data,
                'pagination': {
                    'total': total,
                    'page': page,
                    'limit': limit,
                    'pages': (total + limit - 1) // limit
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting job applications: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@job_blueprint.route('/applications/<application_id>', methods=['GET'])
@require_auth
def get_application(application_id):
    """Get application by ID"""
    try:
        # Get application
        applications = JobApplication.find_by_id(application_id)
        if not applications:
            return jsonify({
                'success': False,
                'error': 'Application not found'
            }), 404
        
        application = applications[0]
        
        # Check if user has permission
        if application.user_id != g.user and g.user_role not in ['admin', 'recruiter']:
            return jsonify({
                'success': False,
                'error': 'Permission denied'
            }), 403
        
        # Get job details
        app_dict = application.to_dict()
        jobs = Job.find_by_id(application.job_id)
        if jobs:
            app_dict['job'] = jobs[0].to_dict()
        
        return jsonify({
            'success': True,
            'data': app_dict
        })
        
    except Exception as e:
        logger.error(f"Error getting application {application_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@job_blueprint.route('/match-score/<job_id>', methods=['GET'])
@require_auth
def get_job_match_score(job_id):
    """Get match score between user's resume and job"""
    try:
        # Get job
        jobs = Job.find_by_id(job_id)
        if not jobs:
            return jsonify({
                'success': False,
                'error': 'Job not found'
            }), 404
        
        job = jobs[0]
        
        # Get user's resume
        resume_id = request.args.get('resume_id')
        resume_data = None
        
        if resume_id:
            # Get specific resume
            resumes = Resume.find_by_id(resume_id)
            if resumes and resumes[0].user_id == g.user:
                resume_data = resumes[0].parsed_data
        else:
            # Get any resume
            resumes = Resume.find_by_user(g.user)
            if resumes:
                latest_resume = max(resumes, key=lambda x: x.created_at if hasattr(x, 'created_at') else '')
                resume_data = latest_resume.parsed_data
        
        if not resume_data:
            return jsonify({
                'success': False,
                'error': 'No resume found'
            }), 404
        
        # Calculate match score
        match_data = job_matcher.calculate_job_match(
            job=job.to_dict(),
            resume_data=resume_data
        )
        
        return jsonify({
            'success': True,
            'data': match_data
        })
        
    except Exception as e:
        logger.error(f"Error calculating match score for job {job_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@job_blueprint.route('/similar/<job_id>', methods=['GET'])
def get_similar_jobs(job_id):
    """Get similar jobs to a given job"""
    try:
        # Get job
        jobs = Job.find_by_id(job_id)
        if not jobs:
            return jsonify({
                'success': False,
                'error': 'Job not found'
            }), 404
        
        job = jobs[0]
        
        # Get similar jobs
        similar_jobs = job_matcher.find_similar_jobs(
            job_id=job_id,
            limit=int(request.args.get('limit', 5))
        )
        
        return jsonify({
            'success': True,
            'data': {
                'jobs': similar_jobs
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting similar jobs for job {job_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500 