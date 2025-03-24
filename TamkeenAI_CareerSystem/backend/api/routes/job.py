"""
Job Routes Module

This module provides API routes for job search, recommendations, and applications.
"""

import logging
from flask import Blueprint, request, jsonify, g
from datetime import datetime

# Import utilities
from backend.utils.date_utils import now, format_date
from backend.utils.cache_utils import cache_result

# Import database models
from backend.database.models import Job, JobApplication, User

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
        salary_min = request.args.get('salary_min', '')
        salary_max = request.args.get('salary_max', '')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        sort_by = request.args.get('sort_by', 'date')
        order = request.args.get('order', 'desc')
        
        # Build query conditions
        conditions = {}
        if job_type:
            conditions['job_type'] = job_type
        if company:
            conditions['company'] = company
        
        # Get all jobs
        all_jobs = Job.find_active()
        
        # Filter jobs
        filtered_jobs = []
        for job in all_jobs:
            # Include job if it matches all criteria
            include = True
            
            # Filter by query text
            if query and not (
                query.lower() in job.title.lower() or 
                query.lower() in job.description.lower() or
                query.lower() in job.company.lower()
            ):
                include = False
            
            # Filter by location
            if location and location.lower() not in job.location.lower():
                include = False
            
            # Filter by salary range
            if salary_min or salary_max:
                # Extract salary range
                try:
                    job_salary = job.salary_range
                    min_salary = job_salary.get('min', 0)
                    max_salary = job_salary.get('max', 0)
                    
                    if salary_min and min_salary < int(salary_min):
                        include = False
                    if salary_max and max_salary > int(salary_max):
                        include = False
                except:
                    # Skip salary filtering if error occurs
                    pass
            
            if include:
                filtered_jobs.append(job)
        
        # Sort jobs
        if sort_by == 'date':
            filtered_jobs.sort(key=lambda x: x.created_at, reverse=(order == 'desc'))
        elif sort_by == 'salary':
            def get_salary(job):
                try:
                    return job.salary_range.get('min', 0)
                except:
                    return 0
            filtered_jobs.sort(key=get_salary, reverse=(order == 'desc'))
        elif sort_by == 'title':
            filtered_jobs.sort(key=lambda x: x.title, reverse=(order == 'desc'))
        elif sort_by == 'company':
            filtered_jobs.sort(key=lambda x: x.company, reverse=(order == 'desc'))
        
        # Pagination
        total = len(filtered_jobs)
        start = (page - 1) * limit
        end = start + limit
        paginated_jobs = filtered_jobs[start:end]
        
        # Prepare response
        job_data = [job.to_dict() for job in paginated_jobs]
        
        return jsonify({
            'success': True,
            'data': {
                'jobs': job_data,
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
    """Get job by ID"""
    try:
        # Get job
        jobs = Job.find_by_id(job_id)
        if not jobs:
            return jsonify({
                'success': False,
                'error': 'Job not found'
            }), 404
        
        job = jobs[0]
        
        # Log job view if user is authenticated
        if g.user:
            # In a real app, we would log this as a user activity
            pass
        
        # Return job data
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


@job_blueprint.route('', methods=['POST'])
@require_auth
@require_role(['admin', 'recruiter'])
def create_job():
    """Create new job (admin or recruiter only)"""
    try:
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Validate required fields
        required_fields = ['title', 'company', 'description']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Create job
        job = Job(
            title=data.get('title'),
            company=data.get('company'),
            location=data.get('location', ''),
            description=data.get('description'),
            requirements=data.get('requirements', ''),
            responsibilities=data.get('responsibilities', ''),
            skills=data.get('skills', ''),
            salary_range=data.get('salary_range', {}),
            job_type=data.get('job_type', 'Full-time'),
            status='active',
            created_at=now().isoformat(),
            updated_at=now().isoformat()
        )
        
        if not job.save():
            return jsonify({
                'success': False,
                'error': 'Error creating job'
            }), 500
        
        return jsonify({
            'success': True,
            'data': job.to_dict(),
            'message': 'Job created successfully'
        })
        
    except Exception as e:
        logger.error(f"Error creating job: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@job_blueprint.route('/<job_id>', methods=['PUT'])
@require_auth
@require_role(['admin', 'recruiter'])
def update_job(job_id):
    """Update job (admin or recruiter only)"""
    try:
        # Get job
        jobs = Job.find_by_id(job_id)
        if not jobs:
            return jsonify({
                'success': False,
                'error': 'Job not found'
            }), 404
        
        job = jobs[0]
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Update fields
        if 'title' in data:
            job.title = data['title']
        if 'company' in data:
            job.company = data['company']
        if 'location' in data:
            job.location = data['location']
        if 'description' in data:
            job.description = data['description']
        if 'requirements' in data:
            job.requirements = data['requirements']
        if 'responsibilities' in data:
            job.responsibilities = data['responsibilities']
        if 'skills' in data:
            job.skills = data['skills']
        if 'salary_range' in data:
            job.salary_range = data['salary_range']
        if 'job_type' in data:
            job.job_type = data['job_type']
        if 'status' in data:
            job.status = data['status']
        
        # Update timestamp
        job.updated_at = now().isoformat()
        
        if not job.save():
            return jsonify({
                'success': False,
                'error': 'Error updating job'
            }), 500
        
        return jsonify({
            'success': True,
            'data': job.to_dict(),
            'message': 'Job updated successfully'
        })
        
    except Exception as e:
        logger.error(f"Error updating job {job_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@job_blueprint.route('/<job_id>', methods=['DELETE'])
@require_auth
@require_role(['admin'])
def delete_job(job_id):
    """Delete job (admin only)"""
    try:
        # Get job
        jobs = Job.find_by_id(job_id)
        if not jobs:
            return jsonify({
                'success': False,
                'error': 'Job not found'
            }), 404
        
        job = jobs[0]
        
        # Delete job
        if not job.delete():
            return jsonify({
                'success': False,
                'error': 'Error deleting job'
            }), 500
        
        return jsonify({
            'success': True,
            'message': 'Job deleted successfully'
        })
        
    except Exception as e:
        logger.error(f"Error deleting job {job_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@job_blueprint.route('/recommended', methods=['GET'])
@require_auth
def get_recommended_jobs():
    """Get recommended jobs for the authenticated user"""
    try:
        # Get user profile
        users = User.find_by_id(g.user)
        if not users:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        user = users[0]
        
        # Get user profile data
        profile = user.profile or {}
        
        # Get matching jobs
        recommended_jobs = job_matcher.match_jobs_to_profile(profile)
        
        # Get pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        # Pagination
        total = len(recommended_jobs)
        start = (page - 1) * limit
        end = start + limit
        paginated_jobs = recommended_jobs[start:end]
        
        # Prepare response
        job_data = [job.to_dict() for job in paginated_jobs]
        
        return jsonify({
            'success': True,
            'data': {
                'jobs': job_data,
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
    """Apply for a job"""
    try:
        # Get job
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
                'error': 'Job is not active'
            }), 400
        
        # Check if user already applied
        existing_applications = JobApplication.find_by_user_and_job(g.user, job_id)
        if existing_applications:
            return jsonify({
                'success': False,
                'error': 'You have already applied for this job'
            }), 400
        
        # Get request data
        data = request.get_json() or {}
        
        # Create application
        application = JobApplication(
            user_id=g.user,
            job_id=job_id,
            status='applied',
            cover_letter=data.get('cover_letter', ''),
            resume_id=data.get('resume_id', ''),
            application_data=data.get('application_data', {}),
            created_at=now().isoformat(),
            updated_at=now().isoformat()
        )
        
        if not application.save():
            return jsonify({
                'success': False,
                'error': 'Error creating application'
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
        
        # Get pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        # Pagination
        total = len(applications)
        start = (page - 1) * limit
        end = start + limit
        paginated_applications = applications[start:end]
        
        # Get job details for each application
        application_data = []
        for application in paginated_applications:
            app_dict = application.to_dict()
            
            # Get job details
            jobs = Job.find_by_id(application.job_id)
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
        logger.error(f"Error getting applications: {str(e)}")
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


@job_blueprint.route('/applications/<application_id>', methods=['PUT'])
@require_auth
@require_role(['admin', 'recruiter'])
def update_application_status(application_id):
    """Update application status (admin or recruiter only)"""
    try:
        # Get application
        applications = JobApplication.find_by_id(application_id)
        if not applications:
            return jsonify({
                'success': False,
                'error': 'Application not found'
            }), 404
        
        application = applications[0]
        
        # Get request data
        data = request.get_json()
        if not data or 'status' not in data:
            return jsonify({
                'success': False,
                'error': 'Status is required'
            }), 400
        
        # Validate status
        valid_statuses = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']
        if data['status'] not in valid_statuses:
            return jsonify({
                'success': False,
                'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'
            }), 400
        
        # Update status
        application.status = data['status']
        
        # Add feedback if provided
        if 'feedback' in data:
            application.feedback = data['feedback']
        
        # Update timestamp
        application.updated_at = now().isoformat()
        
        if not application.save():
            return jsonify({
                'success': False,
                'error': 'Error updating application'
            }), 500
        
        return jsonify({
            'success': True,
            'data': application.to_dict(),
            'message': 'Application updated successfully'
        })
        
    except Exception as e:
        logger.error(f"Error updating application {application_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500