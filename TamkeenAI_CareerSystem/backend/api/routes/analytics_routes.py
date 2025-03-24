"""
Analytics Routes Module

This module provides API routes for generating analytics and insights about
careers, skills, job market, and personalized recommendations.
"""

import logging
from flask import Blueprint, request, jsonify, g
from datetime import datetime

# Import utilities
from backend.utils.date_utils import now, get_date_range
from backend.utils.cache_utils import cache_result

# Import database models
from backend.database.models import User, Resume, Job, JobApplication

# Import core modules
from backend.core.analytics_generator import AnalyticsGenerator

# Import auth decorators
from backend.app import require_auth, require_role

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint
analytics_blueprint = Blueprint('analytics', __name__)

# Create analytics generator
analytics_generator = AnalyticsGenerator()


@analytics_blueprint.route('/market', methods=['GET'])
def get_market_analytics():
    """Get job market analytics"""
    try:
        # Get query params
        industry = request.args.get('industry')
        location = request.args.get('location')
        period = request.args.get('period', '6_months')
        
        # Get date range
        start_date, end_date = get_date_range(period)
        
        # Get market analytics
        market_data = analytics_generator.analyze_job_market(
            industry=industry,
            location=location,
            start_date=start_date,
            end_date=end_date
        )
        
        return jsonify({
            'success': True,
            'data': market_data
        })
        
    except Exception as e:
        logger.error(f"Error getting market analytics: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@analytics_blueprint.route('/skills', methods=['GET'])
def get_skills_analytics():
    """Get skills analytics"""
    try:
        # Get query params
        industry = request.args.get('industry')
        job_title = request.args.get('job_title')
        location = request.args.get('location')
        period = request.args.get('period', '6_months')
        limit = int(request.args.get('limit', 20))
        
        # Get date range
        start_date, end_date = get_date_range(period)
        
        # Get skills analytics
        skills_data = analytics_generator.analyze_in_demand_skills(
            industry=industry,
            job_title=job_title,
            location=location,
            start_date=start_date,
            end_date=end_date,
            limit=limit
        )
        
        return jsonify({
            'success': True,
            'data': skills_data
        })
        
    except Exception as e:
        logger.error(f"Error getting skills analytics: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@analytics_blueprint.route('/emerging-trends', methods=['GET'])
def get_emerging_trends():
    """Get emerging job market trends"""
    try:
        # Get query params
        industry = request.args.get('industry')
        period = request.args.get('period', '1_year')
        
        # Get date range
        start_date, end_date = get_date_range(period)
        
        # Get emerging trends
        trends_data = analytics_generator.analyze_emerging_trends(
            industry=industry,
            start_date=start_date,
            end_date=end_date
        )
        
        return jsonify({
            'success': True,
            'data': trends_data
        })
        
    except Exception as e:
        logger.error(f"Error getting emerging trends: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@analytics_blueprint.route('/salary', methods=['GET'])
def get_salary_analytics():
    """Get salary analytics"""
    try:
        # Get query params
        job_title = request.args.get('job_title')
        location = request.args.get('location')
        experience_level = request.args.get('experience_level')
        
        # Get salary analytics
        salary_data = analytics_generator.analyze_salary_data(
            job_title=job_title,
            location=location,
            experience_level=experience_level
        )
        
        return jsonify({
            'success': True,
            'data': salary_data
        })
        
    except Exception as e:
        logger.error(f"Error getting salary analytics: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@analytics_blueprint.route('/personal', methods=['GET'])
@require_auth
def get_personal_analytics():
    """Get personal analytics for authenticated user"""
    try:
        # Get user data
        users = User.find_by_id(g.user)
        if not users:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        user = users[0]
        
        # Get resume information
        resumes = Resume.find_by_user(g.user)
        resume_data = None
        
        if resumes:
            latest_resume = max(resumes, key=lambda x: x.created_at if hasattr(x, 'created_at') else '')
            resume_data = latest_resume.parsed_data
        
        # Get job application data
        applications = JobApplication.find_by_user(g.user)
        
        # Generate personal analytics
        personal_data = analytics_generator.generate_personal_insights(
            user_id=g.user,
            resume_data=resume_data,
            applications=applications
        )
        
        return jsonify({
            'success': True,
            'data': personal_data
        })
        
    except Exception as e:
        logger.error(f"Error getting personal analytics: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@analytics_blueprint.route('/skills-gap', methods=['GET'])
@require_auth
def get_skills_gap_analysis():
    """Get skills gap analysis for authenticated user"""
    try:
        # Get query params
        target_role = request.args.get('target_role')
        
        if not target_role:
            return jsonify({
                'success': False,
                'error': 'Target role is required'
            }), 400
        
        # Get resume information
        resumes = Resume.find_by_user(g.user)
        
        if not resumes:
            return jsonify({
                'success': False,
                'error': 'No resume found for user'
            }), 404
        
        latest_resume = max(resumes, key=lambda x: x.created_at if hasattr(x, 'created_at') else '')
        resume_data = latest_resume.parsed_data
        
        # Generate skills gap analysis
        skills_gap = analytics_generator.analyze_skills_gap(
            current_skills=resume_data.get('skills', []) if resume_data else [],
            target_role=target_role
        )
        
        return jsonify({
            'success': True,
            'data': skills_gap
        })
        
    except Exception as e:
        logger.error(f"Error getting skills gap analysis: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@analytics_blueprint.route('/career-progression', methods=['GET'])
@require_auth
def get_career_progression_analysis():
    """Get career progression analysis for authenticated user"""
    try:
        # Get query params
        current_role = request.args.get('current_role')
        years_experience = request.args.get('years_experience')
        
        if not current_role:
            return jsonify({
                'success': False,
                'error': 'Current role is required'
            }), 400
        
        # Try to get experience from query params or resume
        experience = None
        if years_experience:
            experience = int(years_experience)
        else:
            # Get resume information
            resumes = Resume.find_by_user(g.user)
            if resumes:
                latest_resume = max(resumes, key=lambda x: x.created_at if hasattr(x, 'created_at') else '')
                resume_data = latest_resume.parsed_data
                
                if resume_data and 'experience' in resume_data:
                    # Calculate total years from experience entries
                    try:
                        total_years = sum(exp.get('years', 0) for exp in resume_data['experience'])
                        experience = total_years
                    except:
                        pass
        
        # Generate career progression analysis
        progression_data = analytics_generator.analyze_career_progression(
            current_role=current_role,
            years_experience=experience
        )
        
        return jsonify({
            'success': True,
            'data': progression_data
        })
        
    except Exception as e:
        logger.error(f"Error getting career progression analysis: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@analytics_blueprint.route('/industry-comparison', methods=['GET'])
def get_industry_comparison():
    """Get comparison of different industries"""
    try:
        # Get query params
        industries = request.args.get('industries', '')
        
        # Convert comma-separated industries to list
        industries_list = [i.strip() for i in industries.split(',') if i.strip()]
        
        if not industries_list:
            return jsonify({
                'success': False,
                'error': 'At least one industry is required'
            }), 400
        
        # Generate industry comparison
        comparison_data = analytics_generator.compare_industries(industries_list)
        
        return jsonify({
            'success': True,
            'data': comparison_data
        })
        
    except Exception as e:
        logger.error(f"Error getting industry comparison: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500 