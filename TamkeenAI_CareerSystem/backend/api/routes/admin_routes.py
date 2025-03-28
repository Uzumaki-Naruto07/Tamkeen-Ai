from flask import Blueprint, request, jsonify, g
import logging
from api.middleware.auth_middleware import token_required
from ..services.auth_service import login_required, admin_required
from ..utils.api_utils import api_response
from ..services.user_service import get_users, get_user_by_id, update_user, delete_user
from ..services.job_service import get_all_jobs, get_job_by_id, update_job, delete_job

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin/hello', methods=['GET'])
def hello():
    """Test endpoint"""
    return jsonify({"message": "Hello from admin API!"}), 200

@admin_bp.route('/admin/protected', methods=['GET'])
@token_required
def protected(current_user):
    """Protected test endpoint"""
    return jsonify({"message": "This is a protected endpoint", "user": current_user}), 200

@admin_bp.route('/analytics/dashboard', methods=['GET'])
@login_required
@admin_required
def get_analytics_dashboard():
    """
    Get comprehensive analytics data for the admin analytics dashboard
    """
    try:
        # In a real implementation, this would fetch data from various services
        # For now, we'll return mock data that matches the frontend's expectations
        
        # Get current date for mock data
        from datetime import datetime, timedelta
        today = datetime.now()
        
        # User registration stats
        user_stats = {
            "total": 1500 + (today.day % 100),  # Random variation based on day
            "active": 1100 + (today.day % 80),
            "newToday": 15 + (today.day % 20),
            "newThisWeek": 85 + (today.day % 40),
            "newThisMonth": 320 + (today.day % 100),
            "growth": 8.2 + (today.day % 10) / 10,  # Growth percentage
            "signupsByDay": []
        }
        
        # Generate signup data for the last 90 days
        for i in range(90, 0, -1):
            date = today - timedelta(days=i)
            day_of_week = date.weekday()
            is_weekend = day_of_week >= 5  # 5 = Saturday, 6 = Sunday
            
            # Lower signups on weekends
            signups = (
                5 + (date.day % 10) if is_weekend 
                else 10 + (date.day % 25)
            )
            
            user_stats["signupsByDay"].append({
                "date": date.strftime("%Y-%m-%d"),
                "signups": signups
            })
        
        # Resume statistics
        resume_stats = {
            "totalResumes": user_stats["total"] * 1.2,
            "avgScore": 71 + (today.day % 10),
            "highestScore": 98,
            "lowestScore": 35,
            "scoreDistribution": [
                {"score": "90-100", "count": int(user_stats["total"] * 0.1)},
                {"score": "80-89", "count": int(user_stats["total"] * 0.25)},
                {"score": "70-79", "count": int(user_stats["total"] * 0.35)},
                {"score": "60-69", "count": int(user_stats["total"] * 0.15)},
                {"score": "50-59", "count": int(user_stats["total"] * 0.1)},
                {"score": "0-49", "count": int(user_stats["total"] * 0.05)}
            ],
            "scoreByTime": []
        }
        
        # Generate score data for the time period
        for day in user_stats["signupsByDay"]:
            date = day["date"]
            # Slightly random score that trends upward over time
            day_index = user_stats["signupsByDay"].index(day)
            base_score = 68 + (day_index / 10)
            
            resume_stats["scoreByTime"].append({
                "date": date,
                "avgScore": round(base_score + (datetime.now().microsecond % 10), 1)
            })
        
        # Skill gap data
        industries = [
            "Technology",
            "Finance",
            "Healthcare",
            "Marketing",
            "Engineering"
        ]
        
        skills = [
            "Programming",
            "Data Analysis",
            "Communication",
            "Leadership",
            "Problem Solving",
            "Design",
            "Project Management"
        ]
        
        skill_gap_data = {
            "industries": industries,
            "skills": skills,
            "data": []
        }
        
        # Generate skill gap matrix
        for industry in industries:
            skill_data = {"industry": industry}
            
            for skill in skills:
                # Random value between 10-90 representing the skill gap percentage
                skill_data[skill] = 10 + (hash(industry + skill) % 80)
            
            skill_gap_data["data"].append(skill_data)
        
        # Leaderboard data
        leaderboard = []
        for i in range(10):
            score = 95 - (i * 3) + (hash(f"user-{i}") % 5)
            leaderboard.append({
                "id": f"user-{i+1}",
                "name": f"User {i+1}",
                "score": score,
                "badges": hash(f"user-{i+1}") % 6,
                "completedProfiles": 1 + (hash(f"user-{i+1}") % 5),
                "dateJoined": (today - timedelta(days=hash(f"user-{i+1}") % 180)).strftime("%Y-%m-%d")
            })
        
        return api_response({
            "userStats": user_stats,
            "resumeStats": resume_stats,
            "skillGapData": skill_gap_data,
            "leaderboard": leaderboard
        })
        
    except Exception as e:
        return api_response({"error": str(e)}, 500)
