from flask import Blueprint, request, jsonify
import logging
from api.middleware.auth_middleware import token_required
from datetime import datetime, timedelta
import random
import json
import os
import uuid

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
gamification_bp = Blueprint('gamification', __name__)

# Mock data storage
USER_GOALS = {}
USER_ACHIEVEMENTS = {}
USER_STATS = {}
USER_ACTIVITIES = {}

# Achievement types and their XP rewards
ACHIEVEMENT_TYPES = {
    "resume_upload": {"name": "Resume Uploaded", "xp": 50, "icon": "description"},
    "resume_score_50": {"name": "Resume Score 50+", "xp": 100, "icon": "trending_up"},
    "resume_score_75": {"name": "Resume Score 75+", "xp": 200, "icon": "star"},
    "resume_score_90": {"name": "Resume Score 90+", "xp": 300, "icon": "military_tech"},
    "job_applied": {"name": "Job Application Submitted", "xp": 30, "icon": "send"},
    "interview_completed": {"name": "Mock Interview Completed", "xp": 150, "icon": "record_voice_over"},
    "skill_added": {"name": "New Skill Added", "xp": 20, "icon": "add_circle"},
    "skill_improved": {"name": "Skill Level Improved", "xp": 40, "icon": "upgrade"},
    "career_assessment": {"name": "Career Assessment Completed", "xp": 100, "icon": "psychology"},
    "daily_login": {"name": "Daily Login", "xp": 10, "icon": "today"},
    "weekly_goals_set": {"name": "Weekly Goals Set", "xp": 30, "icon": "flag"},
    "goal_completed": {"name": "Goal Completed", "xp": 50, "icon": "check_circle"},
    "profile_completed": {"name": "Profile Completed", "xp": 80, "icon": "person"},
    "career_path_selected": {"name": "Career Path Selected", "xp": 70, "icon": "route"},
    "feedback_provided": {"name": "Feedback Provided", "xp": 20, "icon": "rate_review"},
    "streak_3_days": {"name": "3-Day Streak", "xp": 50, "icon": "local_fire_department"},
    "streak_7_days": {"name": "7-Day Streak", "xp": 100, "icon": "whatshot"},
    "streak_30_days": {"name": "30-Day Streak", "xp": 500, "icon": "emoji_events"}
}

# Badges and milestones
BADGES = {
    "resume_master": {
        "id": "resume_master",
        "name": "Resume Master",
        "description": "Achieved a resume score of 90+",
        "icon": "star",
        "required_achievements": ["resume_score_90"],
        "xp_reward": 100
    },
    "interview_pro": {
        "id": "interview_pro",
        "name": "Interview Pro",
        "description": "Completed 5 mock interviews",
        "icon": "record_voice_over",
        "required_achievements": [],
        "required_count": {"interview_completed": 5},
        "xp_reward": 200
    },
    "job_hunter": {
        "id": "job_hunter",
        "name": "Job Hunter",
        "description": "Applied to 10 jobs",
        "icon": "work",
        "required_achievements": [],
        "required_count": {"job_applied": 10},
        "xp_reward": 200
    },
    "skill_collector": {
        "id": "skill_collector",
        "name": "Skill Collector",
        "description": "Added 10 skills to your profile",
        "icon": "psychology",
        "required_achievements": [],
        "required_count": {"skill_added": 10},
        "xp_reward": 150
    },
    "goal_achiever": {
        "id": "goal_achiever",
        "name": "Goal Achiever",
        "description": "Completed 10 goals",
        "icon": "flag",
        "required_achievements": [],
        "required_count": {"goal_completed": 10},
        "xp_reward": 200
    },
    "career_explorer": {
        "id": "career_explorer",
        "name": "Career Explorer",
        "description": "Completed career assessment and selected a career path",
        "icon": "explore",
        "required_achievements": ["career_assessment", "career_path_selected"],
        "xp_reward": 150
    },
    "dedicated_user": {
        "id": "dedicated_user",
        "name": "Dedicated User",
        "description": "Maintained a 7-day login streak",
        "icon": "whatshot",
        "required_achievements": ["streak_7_days"],
        "xp_reward": 100
    },
    "feedback_contributor": {
        "id": "feedback_contributor",
        "name": "Feedback Contributor",
        "description": "Provided 5 pieces of feedback",
        "icon": "rate_review",
        "required_achievements": [],
        "required_count": {"feedback_provided": 5},
        "xp_reward": 100
    }
}

# Career levels
CAREER_LEVELS = [
    {"level": 1, "name": "Career Starter", "min_xp": 0, "icon": "school"},
    {"level": 2, "name": "Career Explorer", "min_xp": 500, "icon": "explore"},
    {"level": 3, "name": "Career Planner", "min_xp": 1500, "icon": "map"},
    {"level": 4, "name": "Career Builder", "min_xp": 3000, "icon": "construction"},
    {"level": 5, "name": "Career Navigator", "min_xp": 6000, "icon": "navigation"},
    {"level": 6, "name": "Career Professional", "min_xp": 10000, "icon": "work"},
    {"level": 7, "name": "Career Strategist", "min_xp": 15000, "icon": "insights"},
    {"level": 8, "name": "Career Expert", "min_xp": 25000, "icon": "psychology"},
    {"level": 9, "name": "Career Master", "min_xp": 40000, "icon": "military_tech"},
    {"level": 10, "name": "Career Legend", "min_xp": 60000, "icon": "emoji_events"}
]

def get_level_from_xp(xp):
    """Get the career level based on XP"""
    current_level = CAREER_LEVELS[0]
    
    for level in CAREER_LEVELS:
        if xp >= level["min_xp"]:
            current_level = level
        else:
            break
    
    return current_level

def get_next_level(current_level):
    """Get the next career level"""
    for i, level in enumerate(CAREER_LEVELS):
        if level["level"] == current_level["level"] and i < len(CAREER_LEVELS) - 1:
            return CAREER_LEVELS[i + 1]
    
    # Return the last level if already at max
    return CAREER_LEVELS[-1]

def calculate_xp_progress(xp, current_level, next_level):
    """Calculate XP progress towards next level"""
    if current_level["level"] == next_level["level"]:
        return 100  # Already at max level
    
    total_xp_required = next_level["min_xp"] - current_level["min_xp"]
    xp_progress = xp - current_level["min_xp"]
    
    percentage = (xp_progress / total_xp_required) * 100 if total_xp_required > 0 else 100
    return min(percentage, 100)  # Cap at 100%

def check_achievements(user_id, achievement_type, count=1):
    """Check for achievements and update user stats"""
    if user_id not in USER_STATS:
        USER_STATS[user_id] = {
            "xp": 0,
            "level": 1,
            "streak_days": 0,
            "last_login": None
        }
    
    if user_id not in USER_ACHIEVEMENTS:
        USER_ACHIEVEMENTS[user_id] = []
    
    if user_id not in USER_ACTIVITIES:
        USER_ACTIVITIES[user_id] = {}
    
    # Update activity counter
    if achievement_type not in USER_ACTIVITIES[user_id]:
        USER_ACTIVITIES[user_id][achievement_type] = 0
    
    USER_ACTIVITIES[user_id][achievement_type] += count
    
    # Check if achievement exists for this type
    if achievement_type in ACHIEVEMENT_TYPES:
        # Add XP
        achievement = ACHIEVEMENT_TYPES[achievement_type]
        xp_gained = achievement["xp"] * count
        USER_STATS[user_id]["xp"] += xp_gained
        
        # Record achievement
        new_achievement = {
            "id": str(uuid.uuid4()),
            "type": achievement_type,
            "name": achievement["name"],
            "icon": achievement["icon"],
            "xp_gained": xp_gained,
            "timestamp": datetime.now().isoformat()
        }
        
        USER_ACHIEVEMENTS[user_id].append(new_achievement)
        
        # Check for new badges
        new_badges = []
        
        for badge_id, badge in BADGES.items():
            # Check if badge already earned
            badge_already_earned = any(a.get("badge_id") == badge_id for a in USER_ACHIEVEMENTS[user_id])
            
            if not badge_already_earned:
                should_award = True
                
                # Check required achievements
                if "required_achievements" in badge:
                    for req in badge["required_achievements"]:
                        if not any(a["type"] == req for a in USER_ACHIEVEMENTS[user_id]):
                            should_award = False
                            break
                
                # Check required counts
                if "required_count" in badge:
                    for req_type, req_count in badge["required_count"].items():
                        if USER_ACTIVITIES[user_id].get(req_type, 0) < req_count:
                            should_award = False
                            break
                
                if should_award:
                    # Award badge
                    badge_achievement = {
                        "id": str(uuid.uuid4()),
                        "type": "badge_earned",
                        "badge_id": badge_id,
                        "name": f"Badge Earned: {badge['name']}",
                        "icon": badge["icon"],
                        "xp_gained": badge["xp_reward"],
                        "timestamp": datetime.now().isoformat()
                    }
                    
                    USER_ACHIEVEMENTS[user_id].append(badge_achievement)
                    USER_STATS[user_id]["xp"] += badge["xp_reward"]
                    
                    new_badges.append({
                        "id": badge_id,
                        "name": badge["name"],
                        "description": badge["description"],
                        "icon": badge["icon"],
                        "xp_reward": badge["xp_reward"]
                    })
        
        # Calculate new level
        old_level = get_level_from_xp(USER_STATS[user_id]["xp"] - xp_gained)
        new_level = get_level_from_xp(USER_STATS[user_id]["xp"])
        
        level_up = new_level["level"] > old_level["level"]
        
        return {
            "achievement": new_achievement,
            "xp_gained": xp_gained,
            "new_badges": new_badges,
            "level_up": level_up,
            "new_level": new_level if level_up else None
        }
    
    return None

def generate_goal_suggestions(user_id, count=3):
    """Generate goal suggestions based on user activities"""
    # Goal templates
    goal_templates = [
        {
            "type": "resume",
            "title": "Update your resume",
            "description": "Add recent experience and skills to your resume",
            "xp_reward": 50,
            "icon": "description",
            "difficulty": "easy",
            "estimated_time": "30 minutes"
        },
        {
            "type": "skills",
            "title": "Add 3 new skills to your profile",
            "description": "Identify and add skills that are relevant to your target career path",
            "xp_reward": 60,
            "icon": "psychology",
            "difficulty": "easy",
            "estimated_time": "15 minutes"
        },
        {
            "type": "job_search",
            "title": "Apply to 3 jobs",
            "description": "Search for and apply to 3 positions that match your career goals",
            "xp_reward": 100,
            "icon": "work",
            "difficulty": "medium",
            "estimated_time": "1-2 hours"
        },
        {
            "type": "interview",
            "title": "Complete a mock interview",
            "description": "Practice your interview skills with our AI interviewer",
            "xp_reward": 150,
            "icon": "record_voice_over",
            "difficulty": "hard",
            "estimated_time": "45 minutes"
        },
        {
            "type": "networking",
            "title": "Connect with 3 industry professionals",
            "description": "Reach out to professionals in your target industry",
            "xp_reward": 80,
            "icon": "people",
            "difficulty": "medium",
            "estimated_time": "1 hour"
        },
        {
            "type": "learning",
            "title": "Complete a course module",
            "description": "Enhance your skills by completing an online course module",
            "xp_reward": 120,
            "icon": "school",
            "difficulty": "medium",
            "estimated_time": "2 hours"
        },
        {
            "type": "profile",
            "title": "Complete your profile",
            "description": "Fill in any missing information in your profile",
            "xp_reward": 40,
            "icon": "person",
            "difficulty": "easy",
            "estimated_time": "20 minutes"
        },
        {
            "type": "assessment",
            "title": "Take a skills assessment",
            "description": "Evaluate your current skills and identify areas for improvement",
            "xp_reward": 90,
            "icon": "quiz",
            "difficulty": "medium",
            "estimated_time": "30 minutes"
        }
    ]
    
    # In a real app, we would personalize this based on user activities
    # Here, we'll just randomly select from templates
    
    selected_goals = random.sample(goal_templates, min(count, len(goal_templates)))
    
    # Add unique ID and due date to each goal
    suggested_goals = []
    current_time = datetime.now()
    
    for goal in selected_goals:
        # Generate a due date between 3-7 days from now
        days_to_add = random.randint(3, 7)
        due_date = (current_time + timedelta(days=days_to_add)).isoformat()
        
        suggested_goal = goal.copy()
        suggested_goal["id"] = str(uuid.uuid4())
        suggested_goal["due_date"] = due_date
        suggested_goal["created_at"] = current_time.isoformat()
        
        suggested_goals.append(suggested_goal)
    
    return suggested_goals

@gamification_bp.route('/gamification/hello', methods=['GET'])
def hello():
    """Test endpoint"""
    return jsonify({"message": "Hello from gamification API!"}), 200

@gamification_bp.route('/gamification/protected', methods=['GET'])
@token_required
def protected(current_user):
    """Protected test endpoint"""
    return jsonify({"message": "This is a protected endpoint", "user": current_user}), 200

@gamification_bp.route('/goals/<user_id>', methods=['GET'])
def get_user_goals(user_id):
    """Get goals for a specific user"""
    user_goals = USER_GOALS.get(user_id, [])
    
    # Group goals by status
    active_goals = [g for g in user_goals if not g.get("completed")]
    completed_goals = [g for g in user_goals if g.get("completed")]
    
    # Sort active goals by due date (ascending)
    active_goals.sort(key=lambda g: g.get("due_date", ""))
    
    # Sort completed goals by completion date (descending)
    completed_goals.sort(key=lambda g: g.get("completed_at", ""), reverse=True)
    
    return jsonify({
        "success": True,
        "user_id": user_id,
        "active_goals": active_goals,
        "completed_goals": completed_goals
    }), 200

@gamification_bp.route('/goals/<user_id>/suggestions', methods=['GET'])
def get_goal_suggestions(user_id):
    """Get goal suggestions for a user"""
    count = int(request.args.get('count', 3))
    suggested_goals = generate_goal_suggestions(user_id, count)
    
    return jsonify({
        "success": True,
        "user_id": user_id,
        "suggested_goals": suggested_goals
    }), 200

@gamification_bp.route('/goals/<user_id>', methods=['POST'])
def add_user_goal(user_id):
    """Add a goal for a user"""
    data = request.json
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Required fields
    title = data.get('title')
    due_date = data.get('due_date')
    
    if not title or not due_date:
        return jsonify({"error": "Title and due date are required"}), 400
    
    # Create goal
    new_goal = {
        "id": str(uuid.uuid4()),
        "title": title,
        "description": data.get('description', ''),
        "due_date": due_date,
        "type": data.get('type', 'custom'),
        "xp_reward": data.get('xp_reward', 50),
        "icon": data.get('icon', 'flag'),
        "difficulty": data.get('difficulty', 'medium'),
        "estimated_time": data.get('estimated_time', ''),
        "completed": False,
        "created_at": datetime.now().isoformat()
    }
    
    # Initialize user goals if not exists
    if user_id not in USER_GOALS:
        USER_GOALS[user_id] = []
    
    USER_GOALS[user_id].append(new_goal)
    
    # Record achievement for setting goals
    achievement_result = check_achievements(user_id, "weekly_goals_set")
    
    return jsonify({
        "success": True,
        "message": "Goal added successfully",
        "goal": new_goal,
        "achievement": achievement_result
    }), 201

@gamification_bp.route('/goals/<user_id>/<goal_id>/complete', methods=['POST'])
def complete_user_goal(user_id, goal_id):
    """Mark a goal as completed"""
    if user_id not in USER_GOALS:
        return jsonify({"error": "User not found"}), 404
    
    # Find the goal
    goal_index = next((i for i, g in enumerate(USER_GOALS[user_id]) if g["id"] == goal_id), None)
    
    if goal_index is None:
        return jsonify({"error": "Goal not found"}), 404
    
    # Check if already completed
    if USER_GOALS[user_id][goal_index].get("completed"):
        return jsonify({"error": "Goal already completed"}), 400
    
    # Mark as completed
    USER_GOALS[user_id][goal_index]["completed"] = True
    USER_GOALS[user_id][goal_index]["completed_at"] = datetime.now().isoformat()
    
    # Get XP reward
    xp_reward = USER_GOALS[user_id][goal_index].get("xp_reward", 50)
    
    # Record achievement
    achievement_result = check_achievements(user_id, "goal_completed")
    
    return jsonify({
        "success": True,
        "message": "Goal marked as completed",
        "goal": USER_GOALS[user_id][goal_index],
        "achievement": achievement_result
    }), 200

@gamification_bp.route('/goals/<user_id>/<goal_id>', methods=['DELETE'])
def delete_user_goal(user_id, goal_id):
    """Delete a user goal"""
    if user_id not in USER_GOALS:
        return jsonify({"error": "User not found"}), 404
    
    # Find the goal
    goal_index = next((i for i, g in enumerate(USER_GOALS[user_id]) if g["id"] == goal_id), None)
    
    if goal_index is None:
        return jsonify({"error": "Goal not found"}), 404
    
    # Remove goal
    removed_goal = USER_GOALS[user_id].pop(goal_index)
    
    return jsonify({
        "success": True,
        "message": "Goal deleted successfully",
        "removed_goal": removed_goal
    }), 200

@gamification_bp.route('/achievements/<user_id>', methods=['GET'])
def get_user_achievements(user_id):
    """Get achievements for a specific user"""
    achievements = USER_ACHIEVEMENTS.get(user_id, [])
    
    # Sort by timestamp (descending)
    achievements.sort(key=lambda a: a.get("timestamp", ""), reverse=True)
    
    return jsonify({
        "success": True,
        "user_id": user_id,
        "achievements": achievements
    }), 200

@gamification_bp.route('/badges/<user_id>', methods=['GET'])
def get_user_badges(user_id):
    """Get badges earned by a user"""
    achievements = USER_ACHIEVEMENTS.get(user_id, [])
    
    # Extract badge achievements
    badge_achievements = [a for a in achievements if "badge_id" in a]
    earned_badges = []
    
    for ba in badge_achievements:
        badge_id = ba["badge_id"]
        if badge_id in BADGES:
            badge = BADGES[badge_id].copy()
            badge["earned_at"] = ba["timestamp"]
            earned_badges.append(badge)
    
    return jsonify({
        "success": True,
        "user_id": user_id,
        "badges": earned_badges
    }), 200

@gamification_bp.route('/stats/<user_id>', methods=['GET'])
def get_user_stats(user_id):
    """Get user statistics"""
    if user_id not in USER_STATS:
        USER_STATS[user_id] = {
            "xp": 0,
            "level": 1,
            "streak_days": 0,
            "last_login": None
        }
    
    stats = USER_STATS[user_id]
    current_level = get_level_from_xp(stats["xp"])
    next_level = get_next_level(current_level)
    
    response = {
        "success": True,
        "user_id": user_id,
        "xp": stats["xp"],
        "level": current_level,
        "next_level": next_level,
        "progress_to_next_level": calculate_xp_progress(stats["xp"], current_level, next_level),
        "streak_days": stats["streak_days"],
        "activities": USER_ACTIVITIES.get(user_id, {})
    }
    
    return jsonify(response), 200

@gamification_bp.route('/record-achievement', methods=['POST'])
def record_achievement():
    """Record an achievement for a user"""
    data = request.json
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    user_id = data.get('user_id')
    achievement_type = data.get('achievement_type')
    count = data.get('count', 1)
    
    if not user_id or not achievement_type:
        return jsonify({"error": "User ID and achievement type are required"}), 400
    
    achievement_result = check_achievements(user_id, achievement_type, count)
    
    if not achievement_result:
        return jsonify({"error": "Invalid achievement type"}), 400
    
    return jsonify({
        "success": True,
        "result": achievement_result
    }), 200

@gamification_bp.route('/login/<user_id>', methods=['POST'])
def record_login(user_id):
    """Record a user login and update streak"""
    if user_id not in USER_STATS:
        USER_STATS[user_id] = {
            "xp": 0,
            "level": 1,
            "streak_days": 0,
            "last_login": None
        }
    
    current_time = datetime.now()
    last_login = USER_STATS[user_id]["last_login"]
    streak_days = USER_STATS[user_id]["streak_days"]
    
    # Convert last_login to datetime if it's a string
    if isinstance(last_login, str):
        try:
            last_login = datetime.fromisoformat(last_login)
        except:
            last_login = None
    
    # Check if this is a new day login
    new_day_login = False
    streak_updated = False
    
    if last_login:
        # Check if login is on a new day
        last_login_date = last_login.date()
        current_date = current_time.date()
        
        if current_date > last_login_date:
            new_day_login = True
            
            # Check if consecutive day for streak
            day_difference = (current_date - last_login_date).days
            
            if day_difference == 1:
                # Consecutive day
                streak_days += 1
                streak_updated = True
            elif day_difference > 1:
                # Streak broken
                streak_days = 1
                streak_updated = True
    else:
        # First login ever
        new_day_login = True
        streak_days = 1
        streak_updated = True
    
    # Update last login and streak
    USER_STATS[user_id]["last_login"] = current_time.isoformat()
    USER_STATS[user_id]["streak_days"] = streak_days
    
    # Record login achievement if new day
    achievements = []
    
    if new_day_login:
        achievements.append(check_achievements(user_id, "daily_login"))
    
    # Check streak milestones
    if streak_updated:
        if streak_days == 3:
            achievements.append(check_achievements(user_id, "streak_3_days"))
        elif streak_days == 7:
            achievements.append(check_achievements(user_id, "streak_7_days"))
        elif streak_days == 30:
            achievements.append(check_achievements(user_id, "streak_30_days"))
    
    return jsonify({
        "success": True,
        "user_id": user_id,
        "streak_days": streak_days,
        "new_day_login": new_day_login,
        "achievements": [a for a in achievements if a]
    }), 200

@gamification_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get user leaderboard based on XP"""
    # Get pagination parameters
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    
    # Create leaderboard entries
    leaderboard = []
    
    for user_id, stats in USER_STATS.items():
        level = get_level_from_xp(stats["xp"])
        leaderboard.append({
            "user_id": user_id,
            "xp": stats["xp"],
            "level": level["level"],
            "level_name": level["name"],
            "streak_days": stats["streak_days"]
        })
    
    # Sort by XP (descending)
    leaderboard.sort(key=lambda x: x["xp"], reverse=True)
    
    # Add rank
    for i, entry in enumerate(leaderboard):
        entry["rank"] = i + 1
    
    # Paginate
    total = len(leaderboard)
    start_index = (page - 1) * limit
    end_index = start_index + limit
    
    paginated_leaderboard = leaderboard[start_index:end_index]
    
    return jsonify({
        "success": True,
        "leaderboard": paginated_leaderboard,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit  # Ceiling division
    }), 200

@gamification_bp.route('/events/<user_id>', methods=['GET'])
def get_upcoming_events(user_id):
    """Get upcoming events for a user"""
    # In a real app, these would be stored in a database
    # Here, we'll generate some mock events
    
    current_time = datetime.now()
    
    # Generate random event types
    event_types = ["interview", "meeting", "deadline", "workshop", "networking", "course"]
    
    # Generate random events for the next 14 days
    upcoming_events = []
    
    for i in range(5):  # Generate 5 events
        days_ahead = random.randint(1, 14)
        hours = random.randint(9, 17)  # Business hours
        minutes = random.choice([0, 15, 30, 45])  # Quarter hours
        
        event_date = current_time + timedelta(days=days_ahead)
        event_date = event_date.replace(hour=hours, minute=minutes, second=0, microsecond=0)
        
        event_type = random.choice(event_types)
        duration = random.choice([30, 60, 90, 120])  # Minutes
        
        title = ""
        if event_type == "interview":
            title = f"Interview with {random.choice(['TechCorp', 'InnoSys', 'WebGuru', 'DataPro', 'CloudTech'])}"
        elif event_type == "meeting":
            title = f"{random.choice(['Career', 'Project', 'Team', 'Strategy', 'Planning'])} Meeting"
        elif event_type == "deadline":
            title = f"{random.choice(['Application', 'Project', 'Assignment', 'Proposal', 'Report'])} Deadline"
        elif event_type == "workshop":
            title = f"{random.choice(['Resume Writing', 'Interview Skills', 'Networking', 'Leadership', 'Public Speaking'])} Workshop"
        elif event_type == "networking":
            title = f"Networking Event: {random.choice(['Tech Mixer', 'Industry Social', 'Professional Meetup', 'Alumni Event', 'Career Fair'])}"
        elif event_type == "course":
            title = f"{random.choice(['Python', 'Web Development', 'Data Science', 'UX Design', 'Project Management'])} Course"
        
        event = {
            "id": str(uuid.uuid4()),
            "title": title,
            "type": event_type,
            "date": event_date.isoformat(),
            "duration": duration,  # minutes
            "location": random.choice(["Online", "Office", "Conference Center", "University", "Virtual"]),
            "description": f"Description for {title}",
            "is_completed": False
        }
        
        upcoming_events.append(event)
    
    # Sort by date (ascending)
    upcoming_events.sort(key=lambda e: e["date"])
    
    return jsonify({
        "success": True,
        "user_id": user_id,
        "events": upcoming_events
    }), 200
