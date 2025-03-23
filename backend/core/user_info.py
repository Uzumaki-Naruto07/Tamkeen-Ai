import uuid
from datetime import datetime
import re

def collect_user_data(data):
    """
    Collect and process user profile information
    
    Args:
        data (dict): User submitted information
        
    Returns:
        dict: Processed user information with validation
    """
    # Generate unique user ID if not provided
    user_id = data.get("user_id", str(uuid.uuid4()))
    
    # Extract and validate core user data
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    
    # Basic email validation
    if email and not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        email = ""  # Invalid email format
    
    phone = data.get("phone", "").strip()
    age = data.get("age", 0)
    try:
        age = int(age)
    except (ValueError, TypeError):
        age = 0
    
    # Process career goals as list
    if isinstance(data.get("career_goals"), list):
        career_goals = data.get("career_goals", [])
    else:
        career_goals = [goal.strip() for goal in data.get("career_goals", "").split(",") if goal.strip()]
    
    # Validate career goals
    career_goals = validate_career_goals(career_goals)
    
    # Process skills with confidence levels
    skills_raw = data.get("skills", {})
    if isinstance(skills_raw, dict):
        skills = skills_raw
    else:
        # Handle skills as comma-separated string
        skills = {}
        skill_list = [s.strip() for s in skills_raw.split(",") if s.strip()]
        for skill in skill_list:
            skills[skill] = {"level": "intermediate", "verified": False}
    
    # Add language proficiency
    languages = data.get("languages", [])
    if not isinstance(languages, list):
        languages = [lang.strip() for lang in data.get("languages", "").split(",") if lang.strip()]
    
    # Create user profile structure
    user_profile = {
        "user_id": user_id,
        "name": name,
        "email": email,
        "phone": phone,
        "age": age,
        "career_goals": career_goals,
        "skills": skills,
        "languages": languages,
        "education": data.get("education", []),
        "experience": data.get("experience", []),
        "certifications": data.get("certifications", []),
        "preferences": data.get("preferences", {}),
        "resume_data": data.get("resume_data", {}),
        "interview_scores": data.get("interview_scores", {}),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "profile_completion": calculate_profile_completion(data),
        "tamkeen_score": calculate_tamkeen_score(data)
    }
    
    return user_profile

def calculate_profile_completion(data):
    """Calculate profile completion percentage based on filled fields"""
    total_fields = 7  # name, email, age, career_goals, skills, education, experience
    filled_fields = 0
    
    if data.get("name", "").strip():
        filled_fields += 1
    
    if data.get("email", "").strip():
        filled_fields += 1
    
    if data.get("age"):
        filled_fields += 1
    
    if data.get("career_goals"):
        filled_fields += 1
    
    if data.get("skills"):
        filled_fields += 1
    
    if data.get("education"):
        filled_fields += 1
    
    if data.get("experience"):
        filled_fields += 1
    
    completion_percentage = (filled_fields / total_fields) * 100
    return round(completion_percentage)

def validate_career_goals(goals):
    """Validate and standardize career goals"""
    valid_goals = []
    common_goals = [
        "promotion", "leadership", "entrepreneurship", "career change",
        "skill development", "work-life balance", "salary increase",
        "job security", "relocation", "professional recognition", 
        "technical advancement", "industry expertise", "work abroad",
        "government sector", "private sector", "freelancing"
    ]
    
    for goal in goals:
        goal = goal.lower().strip()
        # Find closest match in common goals if similar
        matched = False
        for common_goal in common_goals:
            if common_goal in goal or goal in common_goal:
                valid_goals.append(common_goal)
                matched = True
                break
        
        # If no match found, keep original if it's reasonable length
        if not matched and 3 <= len(goal) <= 50:
            valid_goals.append(goal)
    
    return valid_goals

def generate_initial_recommendations(user_profile):
    """Generate initial career recommendations based on user profile"""
    recommendations = {
        "skills_to_develop": [],
        "potential_roles": [],
        "immediate_actions": [],
        "learning_resources": [],
        "networking_suggestions": []
    }
    
    # Simple recommendation logic based on profile completion
    completion = user_profile.get("profile_completion", 0)
    
    if completion < 50:
        recommendations["immediate_actions"].append(
            "Complete your profile to get more accurate recommendations"
        )
    
    # Based on career goals
    career_goals = user_profile.get("career_goals", [])
    for goal in career_goals:
        if "leadership" in goal.lower():
            recommendations["skills_to_develop"].append("Leadership & Management")
            recommendations["potential_roles"].append("Team Lead")
            recommendations["learning_resources"].append({
                "type": "course",
                "name": "Leadership Fundamentals",
                "link": "https://example.com/leadership-course"
            })
        elif "career change" in goal.lower():
            recommendations["immediate_actions"].append(
                "Research required skills for your target industry"
            )
            recommendations["networking_suggestions"].append(
                "Connect with professionals in your target industry on LinkedIn"
            )
        elif "entrepreneurship" in goal.lower():
            recommendations["skills_to_develop"].append("Business Planning")
            recommendations["skills_to_develop"].append("Financial Management")
            recommendations["potential_roles"].append("Startup Founder")
    
    # Based on age - suggest appropriate development paths
    age = user_profile.get("age", 0)
    if 18 <= age <= 25:
        recommendations["immediate_actions"].append(
            "Focus on building fundamental skills through internships and entry-level positions"
        )
    elif 26 <= age <= 35:
        recommendations["immediate_actions"].append(
            "Consider specializing in a high-demand area of your field"
        )
    elif 36 <= age <= 50:
        recommendations["potential_roles"].append("Senior Specialist")
        recommendations["potential_roles"].append("Department Manager")
    
    # Add recommendations based on skills
    skills = user_profile.get("skills", {})
    if "Python" in skills:
        recommendations["potential_roles"].append("Python Developer")
        recommendations["potential_roles"].append("Data Scientist")
    if "Leadership" in skills:
        recommendations["potential_roles"].append("Team Manager")
    
    return recommendations

def calculate_tamkeen_score(data):
    """
    Calculate a comprehensive career readiness score
    
    This score combines profile completeness, skill relevance,
    experience quality, and education-career alignment
    
    Args:
        data (dict): User profile data
        
    Returns:
        int: Tamkeen Career Readiness Score (0-100)
    """
    base_score = calculate_profile_completion(data)
    
    # Add bonus points for complete sections
    bonus_points = 0
    
    # Education quality and relevance
    education = data.get("education", [])
    if education and isinstance(education, list):
        bonus_points += min(len(education) * 3, 10)
    
    # Experience quality and duration
    experience = data.get("experience", [])
    if experience and isinstance(experience, list):
        bonus_points += min(len(experience) * 4, 15)
    
    # Skills diversity and relevance
    skills = data.get("skills", {})
    if skills:
        if isinstance(skills, dict):
            skill_count = len(skills)
        else:
            skill_count = len(skills.split(","))
        bonus_points += min(skill_count, 10)
    
    # Certifications
    certifications = data.get("certifications", [])
    if certifications and isinstance(certifications, list):
        bonus_points += min(len(certifications) * 2, 10)
    
    # Calculate final score, cap at 100
    final_score = min(base_score + bonus_points, 100)
    return final_score

def update_user_profile(user_id, updates):
    """Update existing user profile with new information"""
    # In a real system, this would fetch from a database
    # For this demo, we'll just return the updates with timestamp
    
    updates["updated_at"] = datetime.utcnow().isoformat()
    
    if "profile_completion" not in updates:
        updates["profile_completion"] = calculate_profile_completion(updates)
    
    return {
        "user_id": user_id,
        **updates
    } 