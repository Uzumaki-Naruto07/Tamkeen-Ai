"""
Dashboard Routes Module

This module provides API routes for dashboard data and analytics.
"""

import logging
from flask import Blueprint, request, jsonify, g
from datetime import datetime, timedelta
import json
import random

# Import utilities
from api.utils.date_utils import now
from api.utils.cache_utils import cache_result

# Import auth decorators
from api.utils.auth import auth_required, get_current_user

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint
dashboard_bp = Blueprint('dashboard', __name__)

# Mock data for the dashboard
def generate_mock_dashboard_data(user_id):
    """Generate mock dashboard data for a user"""
    # Current date for reference
    current_date = datetime.now()
    
    # Generate dates for the last 7 days
    dates = [(current_date - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]
    dates.reverse()  # So they're in ascending order
    
    # Mock skill progress (0-100%)
    skills = [
        {"name": "Resume Writing", "progress": random.randint(60, 95)},
        {"name": "Interview Skills", "progress": random.randint(50, 90)},
        {"name": "Technical Skills", "progress": random.randint(70, 98)},
        {"name": "Networking", "progress": random.randint(40, 85)},
        {"name": "Career Planning", "progress": random.randint(55, 88)}
    ]
    
    # Mock resume scores over time
    resume_scores = [
        {"date": dates[0], "score": random.randint(50, 65)},
        {"date": dates[2], "score": random.randint(60, 75)},
        {"date": dates[4], "score": random.randint(70, 85)},
        {"date": dates[6], "score": random.randint(80, 95)}
    ]
    
    # Mock badges earned
    badges = [
        {
            "id": "resume-master",
            "name": "Resume Master",
            "description": "Achieved a resume score of 90+",
            "earned_at": (current_date - timedelta(days=2)).isoformat(),
            "icon": "star"
        },
        {
            "id": "interview-pro",
            "name": "Interview Pro",
            "description": "Completed 5 mock interviews",
            "earned_at": (current_date - timedelta(days=5)).isoformat(),
            "icon": "mic"
        },
        {
            "id": "networker",
            "name": "Networker",
            "description": "Connected with 10+ professionals",
            "earned_at": (current_date - timedelta(days=10)).isoformat(),
            "icon": "people"
        }
    ]
    
    # Mock career paths
    career_paths = [
        {
            "id": "data-science",
            "title": "Data Scientist",
            "description": "Career path for data science professionals",
            "match_score": 0.89,
            "progress": 0.65,
            "levels": 4,
            "current_level": 2
        },
        {
            "id": "software-dev",
            "title": "Software Developer",
            "description": "Career path for software development professionals",
            "match_score": 0.76,
            "progress": 0.45,
            "levels": 5,
            "current_level": 2
        }
    ]
    
    # Mock career prediction
    career_prediction = {
        "primary": {
            "title": "Data Scientist",
            "confidence": 0.87,
            "skills_match": ["Python", "Statistics", "Data Analysis"],
            "missing_skills": ["Machine Learning Deployment", "Cloud Computing"]
        },
        "alternatives": [
            {
                "title": "Data Analyst",
                "confidence": 0.82,
                "skills_match": ["SQL", "Data Visualization", "Excel"],
                "missing_skills": ["Advanced Statistics", "Programming"]
            },
            {
                "title": "Machine Learning Engineer",
                "confidence": 0.75,
                "skills_match": ["Python", "Algorithms", "Mathematics"],
                "missing_skills": ["DevOps", "Model Deployment", "Cloud Services"]
            }
        ]
    }
    
    # Mock market insights
    market_insights = {
        "top_skills": [
            {"name": "Python", "demand": 0.89, "growth": 0.12},
            {"name": "Data Analysis", "demand": 0.87, "growth": 0.09},
            {"name": "Machine Learning", "demand": 0.85, "growth": 0.15}
        ],
        "industry_trends": [
            {"name": "AI & Machine Learning", "growth": 0.25},
            {"name": "Data Science", "growth": 0.21},
            {"name": "Cloud Computing", "growth": 0.18}
        ],
        "salary_ranges": {
            "entry_level": {"min": 70000, "max": 90000},
            "mid_level": {"min": 90000, "max": 120000},
            "senior_level": {"min": 120000, "max": 180000}
        }
    }
    
    # Mock activity log
    activity_log = [
        {
            "activity_type": "resume_updated",
            "description": "Updated resume",
            "timestamp": (current_date - timedelta(hours=5)).isoformat()
        },
        {
            "activity_type": "interview_completed",
            "description": "Completed mock interview for Data Scientist position",
            "timestamp": (current_date - timedelta(days=1, hours=3)).isoformat()
        },
        {
            "activity_type": "job_applied",
            "description": "Applied for Senior Data Analyst at Tech Corp",
            "timestamp": (current_date - timedelta(days=2, hours=7)).isoformat()
        },
        {
            "activity_type": "skill_acquired",
            "description": "Completed course: Advanced SQL for Data Analysis",
            "timestamp": (current_date - timedelta(days=4, hours=2)).isoformat()
        }
    ]
    
    # Complete dashboard data
    dashboard_data = {
        "user_id": user_id,
        "timestamp": now(),
        "user_progress": {
            "overall_score": random.randint(65, 95),
            "completed_tasks": random.randint(8, 15),
            "pending_tasks": random.randint(3, 7),
            "streak_days": random.randint(5, 21)
        },
        "skill_progress": skills,
        "resume_scores": resume_scores,
        "badges": badges,
        "career_paths": career_paths,
        "career_prediction": career_prediction,
        "market_insights": market_insights,
        "activity_log": activity_log,
        "leaderboard_position": random.randint(1, 100)
    }
    
    return dashboard_data


@dashboard_bp.route('/<user_id>', methods=['GET'])
# @auth_required
def get_dashboard_data(user_id):
    """Get dashboard data for a user"""
    try:
        # In a real implementation, we would fetch the actual dashboard data from a database
        # For demo purposes, we'll generate mock data
        dashboard_data = generate_mock_dashboard_data(user_id)
        
        return jsonify(dashboard_data)
    except Exception as e:
        logger.error(f"Error in get_dashboard_data: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch dashboard data'
        }), 500


@dashboard_bp.route('/<user_id>/skills', methods=['POST'])
# @auth_required
def update_skill_progress(user_id):
    """Update skill progress"""
    try:
        # Get request data
        data = request.get_json()
        
        if not data or 'skill_name' not in data or 'progress' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required fields'
            }), 400
        
        # In a real implementation, we would update the actual skill progress in a database
        # For demo purposes, we'll just return success
        
        return jsonify({
            'success': True,
            'message': f"Updated progress for {data['skill_name']} to {data['progress']}%"
        })
    except Exception as e:
        logger.error(f"Error in update_skill_progress: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to update skill progress'
        }), 500


@dashboard_bp.route('/<user_id>/activity', methods=['POST'])
# @auth_required
def track_user_activity(user_id):
    """Track user activity"""
    try:
        # Get request data
        data = request.get_json()
        
        if not data or 'activity_type' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required fields'
            }), 400
        
        # In a real implementation, we would log the activity in a database
        # For demo purposes, we'll just return success
        
        return jsonify({
            'success': True,
            'message': f"Activity tracked: {data['activity_type']}"
        })
    except Exception as e:
        logger.error(f"Error in track_user_activity: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to track user activity'
        }), 500


@dashboard_bp.route('/<user_id>/stats', methods=['POST'])
# @auth_required
def update_dashboard_stats(user_id):
    """Update dashboard stats"""
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Missing required fields'
            }), 400
        
        # In a real implementation, we would update the stats in a database
        # For demo purposes, we'll just return success
        
        return jsonify({
            'success': True,
            'message': "Dashboard stats updated successfully"
        })
    except Exception as e:
        logger.error(f"Error in update_dashboard_stats: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to update dashboard stats'
        }), 500 