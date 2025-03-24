"""
Career Routes Module

This module provides API routes for career path planning, progression, and development.
"""

import logging
from flask import Blueprint, request, jsonify, g
from datetime import datetime

# Import utilities
from backend.utils.date_utils import now
from backend.utils.cache_utils import cache_result

# Import database models
from backend.database.models import User, Resume, CareerPath, CareerMilestone

# Import core modules
from backend.core.career_planning import CareerPlanner

# Import auth decorators
from backend.app import require_auth, require_role

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint
career_blueprint = Blueprint('career', __name__)

# Create career planner
career_planner = CareerPlanner()


@career_blueprint.route('/paths', methods=['GET'])
@require_auth
def get_career_paths():
    """Get available career paths"""
    try:
        # Get query params
        industry = request.args.get('industry')
        level = request.args.get('level')
        
        # Get career paths
        paths = career_planner.get_career_paths(industry=industry, level=level)
        
        return jsonify({
            'success': True,
            'data': {
                'paths': paths
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting career paths: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@career_blueprint.route('/assessment', methods=['POST'])
@require_auth
def career_assessment():
    """Perform career assessment"""
    try:
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Get user's resume for additional data
        resume_id = data.get('resume_id')
        profile_data = {}
        
        if resume_id:
            resumes = Resume.find_by_id(resume_id)
            if resumes and resumes[0].user_id == g.user:
                profile_data = resumes[0].parsed_data or {}
        
        # Perform assessment
        assessment_results = career_planner.assess_career_profile(
            current_role=data.get('current_role'),
            skills=data.get('skills', []),
            interests=data.get('interests', []),
            experience_years=data.get('experience_years'),
            education=data.get('education', []),
            profile_data=profile_data
        )
        
        return jsonify({
            'success': True,
            'data': assessment_results
        })
        
    except Exception as e:
        logger.error(f"Error performing career assessment: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@career_blueprint.route('/recommendations', methods=['POST'])
@require_auth
def get_career_recommendations():
    """Get career path recommendations"""
    try:
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Get user's resume for additional data
        resume_id = data.get('resume_id')
        profile_data = {}
        
        if resume_id:
            resumes = Resume.find_by_id(resume_id)
            if resumes and resumes[0].user_id == g.user:
                profile_data = resumes[0].parsed_data or {}
        
        # Get recommendations
        recommendations = career_planner.recommend_career_paths(
            current_role=data.get('current_role'),
            skills=data.get('skills', []),
            interests=data.get('interests', []),
            experience_years=data.get('experience_years'),
            education=data.get('education', []),
            preferences=data.get('preferences', {}),
            profile_data=profile_data
        )
        
        return jsonify({
            'success': True,
            'data': {
                'recommendations': recommendations
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting career recommendations: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@career_blueprint.route('/paths/<path_id>', methods=['GET'])
@require_auth
def get_career_path_details(path_id):
    """Get career path details"""
    try:
        # Get career path details
        path_details = career_planner.get_career_path_details(path_id)
        
        if not path_details:
            return jsonify({
                'success': False,
                'error': 'Career path not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': path_details
        })
        
    except Exception as e:
        logger.error(f"Error getting career path details: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@career_blueprint.route('/skills/gap', methods=['POST'])
@require_auth
def analyze_skills_gap():
    """Analyze skills gap for a target role"""
    try:
        # Get request data
        data = request.get_json()
        if not data or not data.get('target_role'):
            return jsonify({
                'success': False,
                'error': 'Target role is required'
            }), 400
        
        # Get user's current skills
        current_skills = data.get('current_skills', [])
        
        # Get from resume if provided
        resume_id = data.get('resume_id')
        if resume_id and not current_skills:
            resumes = Resume.find_by_id(resume_id)
            if resumes and resumes[0].user_id == g.user:
                parsed_data = resumes[0].parsed_data or {}
                current_skills = parsed_data.get('skills', [])
        
        # Analyze skills gap
        gap_analysis = career_planner.analyze_skills_gap(
            current_skills=current_skills,
            target_role=data.get('target_role'),
            experience_level=data.get('experience_level', 'mid')
        )
        
        return jsonify({
            'success': True,
            'data': gap_analysis
        })
        
    except Exception as e:
        logger.error(f"Error analyzing skills gap: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@career_blueprint.route('/plan', methods=['POST'])
@require_auth
def create_career_plan():
    """Create a career development plan"""
    try:
        # Get request data
        data = request.get_json()
        if not data or not data.get('target_role'):
            return jsonify({
                'success': False,
                'error': 'Target role is required'
            }), 400
        
        # Create career plan
        career_plan = career_planner.create_development_plan(
            user_id=g.user,
            current_role=data.get('current_role'),
            target_role=data.get('target_role'),
            timeline_months=data.get('timeline_months', 12),
            current_skills=data.get('current_skills', []),
            preferences=data.get('preferences', {})
        )
        
        # Save career path to database
        path = CareerPath(
            user_id=g.user,
            title=f"Path to {data.get('target_role')}",
            description=career_plan.get('summary', ''),
            start_role=data.get('current_role'),
            target_role=data.get('target_role'),
            path_data=career_plan,
            status='active',
            created_at=now().isoformat(),
            updated_at=now().isoformat()
        )
        
        if not path.save():
            return jsonify({
                'success': False,
                'error': 'Error saving career path'
            }), 500
        
        # Create milestones
        milestones = career_plan.get('milestones', [])
        for i, milestone in enumerate(milestones):
            career_milestone = CareerMilestone(
                path_id=path.id,
                title=milestone.get('title', f'Milestone {i+1}'),
                description=milestone.get('description', ''),
                deadline=milestone.get('deadline'),
                skills=milestone.get('skills', []),
                resources=milestone.get('resources', []),
                status='pending',
                order=i+1,
                created_at=now().isoformat(),
                updated_at=now().isoformat()
            )
            career_milestone.save()
        
        return jsonify({
            'success': True,
            'data': {
                'path': path.to_dict(),
                'plan': career_plan
            },
            'message': 'Career plan created successfully'
        })
        
    except Exception as e:
        logger.error(f"Error creating career plan: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@career_blueprint.route('/my-paths', methods=['GET'])
@require_auth
def get_user_career_paths():
    """Get user's career paths"""
    try:
        # Get user's career paths
        paths = CareerPath.find_by_user(g.user)
        
        # Get pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        # Pagination
        total = len(paths)
        start = (page - 1) * limit
        end = start + limit
        paginated_paths = paths[start:end]
        
        # Prepare response
        path_data = [path.to_dict() for path in paginated_paths]
        
        return jsonify({
            'success': True,
            'data': {
                'paths': path_data,
                'pagination': {
                    'total': total,
                    'page': page,
                    'limit': limit,
                    'pages': (total + limit - 1) // limit
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting user career paths: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@career_blueprint.route('/my-paths/<path_id>', methods=['GET'])
@require_auth
def get_user_career_path(path_id):
    """Get user's career path details"""
    try:
        # Get career path
        paths = CareerPath.find_by_id(path_id)
        if not paths:
            return jsonify({
                'success': False,
                'error': 'Career path not found'
            }), 404
        
        path = paths[0]
        
        # Check if user has permission
        if path.user_id != g.user and g.user_role != 'admin':
            return jsonify({
                'success': False,
                'error': 'Permission denied'
            }), 403
        
        # Get milestones
        milestones = CareerMilestone.find_by_path(path.id)
        milestone_data = [milestone.to_dict() for milestone in milestones]
        
        # Prepare response
        path_data = path.to_dict()
        path_data['milestones'] = milestone_data
        
        return jsonify({
            'success': True,
            'data': path_data
        })
        
    except Exception as e:
        logger.error(f"Error getting career path {path_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@career_blueprint.route('/my-paths/<path_id>/milestones/<milestone_id>', methods=['PUT'])
@require_auth
def update_milestone(path_id, milestone_id):
    """Update career milestone"""
    try:
        # Get career path
        paths = CareerPath.find_by_id(path_id)
        if not paths:
            return jsonify({
                'success': False,
                'error': 'Career path not found'
            }), 404
        
        path = paths[0]
        
        # Check if user has permission
        if path.user_id != g.user and g.user_role != 'admin':
            return jsonify({
                'success': False,
                'error': 'Permission denied'
            }), 403
        
        # Get milestone
        milestones = CareerMilestone.find_by_id(milestone_id)
        if not milestones:
            return jsonify({
                'success': False,
                'error': 'Milestone not found'
            }), 404
        
        milestone = milestones[0]
        
        # Check if milestone belongs to path
        if milestone.path_id != path.id:
            return jsonify({
                'success': False,
                'error': 'Milestone does not belong to this path'
            }), 400
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Update milestone
        if 'status' in data:
            milestone.status = data['status']
        
        if 'title' in data:
            milestone.title = data['title']
            
        if 'description' in data:
            milestone.description = data['description']
            
        if 'deadline' in data:
            milestone.deadline = data['deadline']
            
        if 'skills' in data:
            milestone.skills = data['skills']
            
        if 'resources' in data:
            milestone.resources = data['resources']
        
        milestone.updated_at = now().isoformat()
        
        if not milestone.save():
            return jsonify({
                'success': False,
                'error': 'Error updating milestone'
            }), 500
        
        return jsonify({
            'success': True,
            'data': milestone.to_dict(),
            'message': 'Milestone updated successfully'
        })
        
    except Exception as e:
        logger.error(f"Error updating milestone {milestone_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@career_blueprint.route('/transition', methods=['POST'])
@require_auth
def analyze_career_transition():
    """Analyze career transition feasibility"""
    try:
        # Get request data
        data = request.get_json()
        if not data or not data.get('current_role') or not data.get('target_role'):
            return jsonify({
                'success': False,
                'error': 'Current role and target role are required'
            }), 400
        
        # Analyze transition
        transition_analysis = career_planner.analyze_career_transition(
            current_role=data.get('current_role'),
            target_role=data.get('target_role'),
            current_skills=data.get('current_skills', []),
            experience_years=data.get('experience_years', 0),
            education=data.get('education', [])
        )
        
        return jsonify({
            'success': True,
            'data': transition_analysis
        })
        
    except Exception as e:
        logger.error(f"Error analyzing career transition: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500 