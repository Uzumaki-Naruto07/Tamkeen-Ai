"""
Career Routes Module

This module provides API routes for career path planning, progression, and development.
"""

import logging
from flask import Blueprint, request, jsonify, g
from datetime import datetime
import uuid
from typing import Dict, List, Any, Optional
import random
import json
import os

# Import utilities
from api.utils.date_utils import now
from api.utils.cache_utils import cache_result

# Import database models
from api.database.models import User, Resume

# Create CareerPath and CareerMilestone classes
class CareerPath:
    """Career path model."""
    
    def __init__(self, user_id=None, title=None, description=None, milestones=None, 
                 status=None, created_at=None, updated_at=None):
        """Initialize a career path object."""
        self.id = str(uuid.uuid4())
        self.user_id = user_id
        self.title = title
        self.description = description
        self.milestones = milestones or []
        self.status = status or 'active'
        self.created_at = created_at or datetime.now().isoformat()
        self.updated_at = updated_at or datetime.now().isoformat()
    
    def save(self):
        """Save the career path to the database."""
        # This is a placeholder for actual database saving logic
        return True
    
    def delete(self):
        """Delete the career path from the database."""
        # This is a placeholder for actual database deletion logic
        return True
    
    def to_dict(self):
        """Convert the career path to a dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'milestones': [m.to_dict() for m in self.milestones] if self.milestones else [],
            'status': self.status,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    
    @staticmethod
    def find_by_user(user_id):
        """Find career paths by user ID."""
        # This is a placeholder for actual database query logic
        return []
    
    @staticmethod
    def find_by_id(path_id):
        """Find a career path by its ID."""
        # This is a placeholder for actual database query logic
        return None

class CareerMilestone:
    """Career milestone model."""
    
    def __init__(self, path_id=None, title=None, description=None, 
                 target_date=None, status=None, created_at=None, updated_at=None):
        """Initialize a career milestone object."""
        self.id = str(uuid.uuid4())
        self.path_id = path_id
        self.title = title
        self.description = description
        self.target_date = target_date
        self.status = status or 'pending'
        self.created_at = created_at or datetime.now().isoformat()
        self.updated_at = updated_at or datetime.now().isoformat()
    
    def save(self):
        """Save the milestone to the database."""
        # This is a placeholder for actual database saving logic
        return True
    
    def delete(self):
        """Delete the milestone from the database."""
        # This is a placeholder for actual database deletion logic
        return True
    
    def to_dict(self):
        """Convert the milestone to a dictionary."""
        return {
            'id': self.id,
            'path_id': self.path_id,
            'title': self.title,
            'description': self.description,
            'target_date': self.target_date,
            'status': self.status,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

# Import core modules if available
try:
    from api.core.career_planning import CareerPlanner
    career_planner = CareerPlanner()
except ImportError:
    career_planner = None
    logger = logging.getLogger(__name__)
    logger.warning("CareerPlanner not available")

# Import auth decorators if available
try:
    from api.app import require_auth, require_role
except ImportError:
    # Placeholder decorators if not available
    def require_auth(f): return f
    def require_role(*args, **kwargs): return lambda f: f

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint with the name expected in app.py
career_bp = Blueprint('career', __name__)

# Path to mock data files
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../static/data')
os.makedirs(DATA_DIR, exist_ok=True)

# Mock career paths data
CAREER_PATHS = [
    {
        "id": "data-science",
        "title": "Data Scientist",
        "description": "Analyze and interpret complex data to help organizations make better decisions",
        "salary_range": {"min": 70000, "max": 150000, "currency": "USD"},
        "growth_rate": 22,  # Percentage growth expected over next 5 years
        "required_education": ["Bachelor's", "Master's", "Ph.D."],
        "key_skills": ["Python", "Machine Learning", "SQL", "Statistics", "Data Visualization"],
        "job_outlook": "Excellent",
        "industry_sectors": ["Tech", "Finance", "Healthcare", "Retail", "Manufacturing"]
    },
    {
        "id": "software-dev",
        "title": "Software Developer",
        "description": "Design, build, and maintain software applications",
        "salary_range": {"min": 65000, "max": 140000, "currency": "USD"},
        "growth_rate": 18,
        "required_education": ["Bachelor's", "Coding Bootcamp", "Self-taught"],
        "key_skills": ["JavaScript", "Python", "Java", "Git", "Problem Solving"],
        "job_outlook": "Excellent",
        "industry_sectors": ["Tech", "Finance", "E-commerce", "Gaming", "Healthcare"]
    },
    {
        "id": "ux-designer",
        "title": "UX Designer",
        "description": "Create meaningful and relevant experiences for users",
        "salary_range": {"min": 60000, "max": 120000, "currency": "USD"},
        "growth_rate": 15,
        "required_education": ["Bachelor's", "UX Certificate", "Self-taught"],
        "key_skills": ["User Research", "Wireframing", "Prototyping", "UI Design", "Usability Testing"],
        "job_outlook": "Very Good",
        "industry_sectors": ["Tech", "E-commerce", "Consulting", "Entertainment", "Healthcare"]
    },
    {
        "id": "product-manager",
        "title": "Product Manager",
        "description": "Guide the development of products from conception to launch",
        "salary_range": {"min": 75000, "max": 160000, "currency": "USD"},
        "growth_rate": 17,
        "required_education": ["Bachelor's", "MBA", "Technical Background"],
        "key_skills": ["Strategy", "Communication", "Data Analysis", "Market Research", "Roadmapping"],
        "job_outlook": "Excellent",
        "industry_sectors": ["Tech", "Finance", "Retail", "Healthcare", "Manufacturing"]
    },
    {
        "id": "cloud-architect",
        "title": "Cloud Architect",
        "description": "Design and oversee cloud computing strategies and implementation",
        "salary_range": {"min": 90000, "max": 180000, "currency": "USD"},
        "growth_rate": 25,
        "required_education": ["Bachelor's", "Master's", "Certifications"],
        "key_skills": ["AWS", "Azure", "GCP", "Infrastructure as Code", "Security"],
        "job_outlook": "Excellent",
        "industry_sectors": ["Tech", "Finance", "Healthcare", "Government", "Consulting"]
    }
]

# Personality types and their career matches (MBTI-inspired)
PERSONALITY_CAREER_MATCHES = {
    "INTJ": ["data-science", "software-dev", "cloud-architect"],
    "INTP": ["data-science", "software-dev", "research-scientist"],
    "ENTJ": ["product-manager", "tech-lead", "cto"],
    "ENTP": ["entrepreneur", "product-manager", "consultant"],
    "INFJ": ["ux-designer", "content-strategist", "career-counselor"],
    "INFP": ["ux-designer", "content-creator", "technical-writer"],
    "ENFJ": ["product-manager", "team-lead", "hr-specialist"],
    "ENFP": ["ux-designer", "marketing-specialist", "community-manager"],
    "ISTJ": ["database-admin", "security-specialist", "systems-analyst"],
    "ISFJ": ["quality-assurance", "customer-support", "technical-writer"],
    "ESTJ": ["project-manager", "operations-manager", "business-analyst"],
    "ESFJ": ["customer-success", "account-manager", "hr-specialist"],
    "ISTP": ["software-dev", "devops-engineer", "penetration-tester"],
    "ISFP": ["ui-designer", "graphic-designer", "multimedia-artist"],
    "ESTP": ["sales-engineer", "product-manager", "entrepreneur"],
    "ESFP": ["customer-advocate", "social-media-manager", "marketing-specialist"]
}

# Education levels and their match with career paths
EDUCATION_CAREER_MATCHES = {
    "high-school": ["customer-support", "junior-developer", "qa-tester"],
    "associates": ["web-developer", "it-support", "junior-analyst"],
    "bachelors": ["software-dev", "data-analyst", "ux-designer", "product-manager"],
    "masters": ["data-science", "senior-developer", "cloud-architect", "research-scientist"],
    "phd": ["research-scientist", "ai-specialist", "chief-scientist"]
}

def get_career_recommendation(personality_type, education_level, skills):
    """
    Generate career recommendations based on personality, education, and skills
    This is a simplified mock implementation
    """
    matching_careers = []
    
    # Add careers matching personality
    if personality_type in PERSONALITY_CAREER_MATCHES:
        matching_careers.extend([c for c in PERSONALITY_CAREER_MATCHES[personality_type] if c not in matching_careers])
    
    # Add careers matching education level
    if education_level in EDUCATION_CAREER_MATCHES:
        matching_careers.extend([c for c in EDUCATION_CAREER_MATCHES[education_level] if c not in matching_careers])
    
    # Convert to list of full career path objects, with match scores
    recommended_careers = []
    for career_id in matching_careers:
        # Find the career path from our data
        career_path = next((cp for cp in CAREER_PATHS if cp["id"] == career_id), None)
        if career_path:
            # Calculate a mock match score
            match_score = random.uniform(0.65, 0.95)
            career_with_score = career_path.copy()
            career_with_score["match_score"] = round(match_score, 2)
            recommended_careers.append(career_with_score)
    
    # If no matches found, return some default recommendations
    if not recommended_careers:
        for career_path in CAREER_PATHS[:3]:
            match_score = random.uniform(0.5, 0.75)
            career_with_score = career_path.copy()
            career_with_score["match_score"] = round(match_score, 2)
            recommended_careers.append(career_with_score)
    
    # Sort by match score
    recommended_careers.sort(key=lambda x: x["match_score"], reverse=True)
    
    return recommended_careers[:3]  # Return top 3 recommendations

@career_bp.route('/paths', methods=['GET'])
def get_career_paths():
    """Get all available career paths"""
    return jsonify({
        "success": True,
        "career_paths": CAREER_PATHS
    }), 200

@career_bp.route('/path/<path_id>', methods=['GET'])
def get_career_path(path_id):
    """Get details for a specific career path"""
    career_path = next((cp for cp in CAREER_PATHS if cp["id"] == path_id), None)
    
    if not career_path:
        return jsonify({
            "success": False,
            "error": "Career path not found"
        }), 404
    
    return jsonify({
        "success": True,
        "career_path": career_path
    }), 200

@career_bp.route('/recommend', methods=['POST'])
def recommend_career_paths():
    """Recommend career paths based on user profile"""
    data = request.json
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    personality_type = data.get('personality_type', '')
    education_level = data.get('education_level', '')
    skills = data.get('skills', [])
    
    recommended_careers = get_career_recommendation(personality_type, education_level, skills)
    
    return jsonify({
        "success": True,
        "recommendations": recommended_careers,
        "timestamp": datetime.now().isoformat()
    }), 200

@career_bp.route('/personality-test', methods=['GET'])
def get_personality_test():
    """Get personality test questions"""
    personality_test = {
        "test_id": "mbti-inspired",
        "description": "This test helps identify your career-oriented personality traits",
        "questions": [
            {
                "id": "q1",
                "text": "When faced with a problem, I prefer to:",
                "options": [
                    {"id": "a", "text": "Analyze it logically"},
                    {"id": "b", "text": "Consider how it affects people"}
                ],
                "dimension": "T-F"
            },
            {
                "id": "q2",
                "text": "In social situations, I tend to:",
                "options": [
                    {"id": "a", "text": "Initiate conversations and meet new people"},
                    {"id": "b", "text": "Wait for others to approach me"}
                ],
                "dimension": "E-I"
            },
            {
                "id": "q3",
                "text": "I prefer to work with:",
                "options": [
                    {"id": "a", "text": "Concrete facts and data"},
                    {"id": "b", "text": "Abstract concepts and possibilities"}
                ],
                "dimension": "S-N"
            },
            {
                "id": "q4",
                "text": "When making decisions, I prefer to:",
                "options": [
                    {"id": "a", "text": "Have things settled and decided"},
                    {"id": "b", "text": "Keep my options open"}
                ],
                "dimension": "J-P"
            },
            {
                "id": "q5",
                "text": "I am more interested in:",
                "options": [
                    {"id": "a", "text": "What is happening now (present)"},
                    {"id": "b", "text": "What could happen in the future"}
                ],
                "dimension": "S-N"
            },
            {
                "id": "q6",
                "text": "In team settings, I typically:",
                "options": [
                    {"id": "a", "text": "Speak up and share my thoughts readily"},
                    {"id": "b", "text": "Think carefully before contributing"}
                ],
                "dimension": "E-I"
            },
            {
                "id": "q7",
                "text": "When evaluating an idea, I focus more on:",
                "options": [
                    {"id": "a", "text": "If it's practical and makes logical sense"},
                    {"id": "b", "text": "How it aligns with my values and beliefs"}
                ],
                "dimension": "T-F"
            },
            {
                "id": "q8",
                "text": "I prefer environments that are:",
                "options": [
                    {"id": "a", "text": "Structured and organized"},
                    {"id": "b", "text": "Flexible and adaptable"}
                ],
                "dimension": "J-P"
            }
        ]
    }
    
    return jsonify({
        "success": True,
        "personality_test": personality_test
    }), 200

@career_bp.route('/personality-result', methods=['POST'])
def calculate_personality_result():
    """Calculate personality type based on test answers"""
    data = request.json
    
    if not data or 'answers' not in data:
        return jsonify({"error": "No answers provided"}), 400
    
    answers = data.get('answers', {})
    
    # In a real implementation, this would use the answers to calculate
    # the personality type. This is a simplified mock implementation.
    
    # Count dimensions for simple mock calculation
    e_count = 0
    i_count = 0
    s_count = 0
    n_count = 0
    t_count = 0
    f_count = 0
    j_count = 0
    p_count = 0
    
    # Mock dimension counters based on question IDs
    # In a real implementation, this would be based on actual answers
    for q_id, answer in answers.items():
        if q_id in ['q2', 'q6']:
            if answer == 'a':
                e_count += 1
            else:
                i_count += 1
        elif q_id in ['q3', 'q5']:
            if answer == 'a':
                s_count += 1
            else:
                n_count += 1
        elif q_id in ['q1', 'q7']:
            if answer == 'a':
                t_count += 1
            else:
                f_count += 1
        elif q_id in ['q4', 'q8']:
            if answer == 'a':
                j_count += 1
            else:
                p_count += 1
    
    # Determine personality type
    personality_type = ""
    personality_type += "E" if e_count > i_count else "I"
    personality_type += "S" if s_count > n_count else "N"
    personality_type += "T" if t_count > f_count else "F"
    personality_type += "J" if j_count > p_count else "P"
    
    # If no valid type was determined, return a random one
    if len(personality_type) != 4:
        personality_type = random.choice(list(PERSONALITY_CAREER_MATCHES.keys()))
    
    # Get career recommendations based on personality type
    career_ids = PERSONALITY_CAREER_MATCHES.get(personality_type, [])
    recommended_careers = []
    
    for career_id in career_ids[:3]:  # Get top 3
        career_path = next((cp for cp in CAREER_PATHS if cp["id"] == career_id), None)
        if career_path:
            match_score = random.uniform(0.75, 0.95)
            career_with_score = career_path.copy()
            career_with_score["match_score"] = round(match_score, 2)
            recommended_careers.append(career_with_score)
    
    # If no careers found, return some defaults
    if not recommended_careers:
        for career_path in CAREER_PATHS[:3]:
            match_score = random.uniform(0.5, 0.75)
            career_with_score = career_path.copy()
            career_with_score["match_score"] = round(match_score, 2)
            recommended_careers.append(career_with_score)
    
    # Generate personality insights based on type
    personality_insights = {
        "type": personality_type,
        "description": f"As an {personality_type}, you tend to be " + ({
            "INTJ": "analytical, strategic, and independent in your approach to work.",
            "INTP": "logical, innovative, and analytical in solving complex problems.",
            "ENTJ": "decisive, strategic, and natural at leadership roles.",
            "ENTP": "innovative, entrepreneurial, and skilled at creative problem-solving.",
            "INFJ": "insightful, creative, and deeply committed to helping others.",
            "INFP": "idealistic, creative, and driven by personal values and beliefs.",
            "ENFJ": "charismatic, empathetic, and excellent at facilitating group success.",
            "ENFP": "enthusiastic, creative, and skilled at connecting with diverse people.",
            "ISTJ": "organized, practical, and reliable in executing detailed work.",
            "ISFJ": "conscientious, loyal, and dedicated to supporting others.",
            "ESTJ": "efficient, logical, and adept at implementing practical solutions.",
            "ESFJ": "cooperative, supportive, and skilled at creating harmony.",
            "ISTP": "analytical, practical, and excellent at solving hands-on problems.",
            "ISFP": "artistic, adaptable, and driven by personal values in your work.",
            "ESTP": "energetic, pragmatic, and skilled at navigating dynamic situations.",
            "ESFP": "spontaneous, energetic, and excellent at engaging with others."
        }.get(personality_type, "balanced in various work approaches.")),
        "strengths": ({
            "INTJ": ["Strategic thinking", "Independent work", "Complex problem solving"],
            "INTP": ["Logical analysis", "Conceptual thinking", "Innovative solutions"],
            "ENTJ": ["Leadership", "Strategic planning", "Decision making"],
            "ENTP": ["Innovation", "Adaptability", "Creative problem-solving"],
            "INFJ": ["Insight into others", "Long-term planning", "Creative vision"],
            "INFP": ["Creativity", "Value-centered work", "Empathetic understanding"],
            "ENFJ": ["People development", "Communication", "Organizational leadership"],
            "ENFP": ["Enthusiasm", "Creative collaboration", "Interpersonal skills"],
            "ISTJ": ["Attention to detail", "Reliability", "Systematic approach"],
            "ISFJ": ["Supporting others", "Practical assistance", "Detailed work"],
            "ESTJ": ["Practical organization", "Clarity in execution", "Efficiency"],
            "ESFJ": ["Team harmony", "Practical support", "Customer service"],
            "ISTP": ["Technical expertise", "Practical problem-solving", "Crisis management"],
            "ISFP": ["Artistic expression", "Practical creativity", "Adaptability"],
            "ESTP": ["Action-orientation", "Negotiation", "Crisis management"],
            "ESFP": ["People engagement", "Practical teamwork", "Enthusiasm"]
        }.get(personality_type, ["Adaptability", "Balance", "Versatility"])),
        "career_suggestions": recommended_careers
    }
    
    return jsonify({
        "success": True,
        "personality_result": personality_insights,
        "timestamp": datetime.now().isoformat()
    }), 200

@career_bp.route('/skills/<path_id>', methods=['GET'])
def get_path_skills(path_id):
    """Get required skills for a specific career path"""
    career_path = next((cp for cp in CAREER_PATHS if cp["id"] == path_id), None)
    
    if not career_path:
        return jsonify({
            "success": False,
            "error": "Career path not found"
        }), 404
    
    # Extended skills beyond the basic list in career path
    extended_skills = {
        "data-science": {
            "technical": [
                {"name": "Python", "importance": 5},
                {"name": "R", "importance": 4},
                {"name": "SQL", "importance": 4},
                {"name": "Machine Learning", "importance": 5},
                {"name": "Data Visualization", "importance": 4},
                {"name": "Statistical Analysis", "importance": 5},
                {"name": "Deep Learning", "importance": 3},
                {"name": "Big Data Technologies", "importance": 3},
                {"name": "Data Cleaning", "importance": 4},
                {"name": "Feature Engineering", "importance": 4}
            ],
            "soft": [
                {"name": "Problem Solving", "importance": 5},
                {"name": "Communication", "importance": 4},
                {"name": "Critical Thinking", "importance": 5},
                {"name": "Domain Knowledge", "importance": 3},
                {"name": "Teamwork", "importance": 3}
            ],
            "certifications": [
                "IBM Data Science Professional",
                "Google Data Analytics Professional",
                "Microsoft Certified: Azure Data Scientist Associate",
                "AWS Certified Data Analytics"
            ]
        },
        "software-dev": {
            "technical": [
                {"name": "JavaScript", "importance": 5},
                {"name": "Python", "importance": 4},
                {"name": "Java", "importance": 4},
                {"name": "HTML/CSS", "importance": 4},
                {"name": "SQL", "importance": 3},
                {"name": "Git", "importance": 5},
                {"name": "React", "importance": 4},
                {"name": "Node.js", "importance": 4},
                {"name": "RESTful APIs", "importance": 4},
                {"name": "Testing", "importance": 3}
            ],
            "soft": [
                {"name": "Problem Solving", "importance": 5},
                {"name": "Communication", "importance": 4},
                {"name": "Teamwork", "importance": 4},
                {"name": "Time Management", "importance": 3},
                {"name": "Adaptability", "importance": 4}
            ],
            "certifications": [
                "AWS Certified Developer",
                "Microsoft Certified: Azure Developer Associate",
                "Oracle Certified Professional, Java SE Programmer",
                "Google Associate Android Developer"
            ]
        }
    }
    
    # Return default structure if extended skills not found
    if path_id not in extended_skills:
        return jsonify({
            "success": True,
            "skills": {
                "technical": [{"name": skill, "importance": 4} for skill in career_path.get("key_skills", [])],
                "soft": [
                    {"name": "Communication", "importance": 4},
                    {"name": "Problem Solving", "importance": 4},
                    {"name": "Teamwork", "importance": 3}
                ],
                "certifications": []
            }
        }), 200
    
    return jsonify({
        "success": True,
        "skills": extended_skills[path_id]
    }), 200

@career_bp.route('/roadmap/<path_id>', methods=['GET'])
def get_career_roadmap(path_id):
    """Get a career roadmap for a specific path"""
    career_path = next((cp for cp in CAREER_PATHS if cp["id"] == path_id), None)
    
    if not career_path:
        return jsonify({
            "success": False,
            "error": "Career path not found"
        }), 404
    
    # Mock roadmaps for common paths
    roadmaps = {
        "data-science": {
            "entry_level": {
                "title": "Junior Data Analyst",
                "duration": "1-2 years",
                "key_skills": ["Python Basics", "SQL", "Data Cleaning", "Basic Statistics"],
                "description": "Focus on data cleaning, basic analysis, and visualization tasks"
            },
            "mid_level": {
                "title": "Data Scientist",
                "duration": "2-5 years",
                "key_skills": ["Advanced Python", "Machine Learning", "Statistical Modeling", "Data Visualization"],
                "description": "Build prediction models, perform complex analyses, and communicate insights"
            },
            "senior_level": {
                "title": "Lead Data Scientist",
                "duration": "5+ years",
                "key_skills": ["Deep Learning", "Big Data", "Team Leadership", "Business Strategy"],
                "description": "Guide data strategy, lead teams, and connect data science to business outcomes"
            },
            "learning_resources": [
                {
                    "title": "Python for Data Science",
                    "platform": "Coursera",
                    "difficulty": "Beginner",
                    "url": "https://www.coursera.org/specializations/python"
                },
                {
                    "title": "Machine Learning",
                    "platform": "Stanford Online",
                    "difficulty": "Intermediate",
                    "url": "https://www.coursera.org/learn/machine-learning"
                },
                {
                    "title": "Deep Learning Specialization",
                    "platform": "Coursera",
                    "difficulty": "Advanced",
                    "url": "https://www.coursera.org/specializations/deep-learning"
                }
            ]
        },
        "software-dev": {
            "entry_level": {
                "title": "Junior Developer",
                "duration": "1-2 years",
                "key_skills": ["HTML/CSS", "JavaScript", "Git", "Basic Algorithms"],
                "description": "Work on feature implementation, bug fixes, and learn from senior developers"
            },
            "mid_level": {
                "title": "Software Developer",
                "duration": "2-5 years",
                "key_skills": ["Full-stack Development", "APIs", "Testing", "Design Patterns"],
                "description": "Design and implement features, participate in architecture decisions"
            },
            "senior_level": {
                "title": "Senior Developer / Tech Lead",
                "duration": "5+ years",
                "key_skills": ["System Design", "Team Leadership", "Performance Optimization", "Architecture"],
                "description": "Lead technical decisions, mentor junior developers, and guide project architecture"
            },
            "learning_resources": [
                {
                    "title": "The Web Developer Bootcamp",
                    "platform": "Udemy",
                    "difficulty": "Beginner",
                    "url": "https://www.udemy.com/course/the-web-developer-bootcamp/"
                },
                {
                    "title": "JavaScript: Understanding the Weird Parts",
                    "platform": "Udemy",
                    "difficulty": "Intermediate",
                    "url": "https://www.udemy.com/course/understand-javascript/"
                },
                {
                    "title": "Clean Code",
                    "platform": "Book by Robert C. Martin",
                    "difficulty": "Intermediate",
                    "url": "https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882"
                }
            ]
        }
    }
    
    # Return default structure if roadmap not found
    if path_id not in roadmaps:
        default_roadmap = {
            "entry_level": {
                "title": f"Junior {career_path['title']}",
                "duration": "1-2 years",
                "key_skills": career_path.get("key_skills", [])[:3],
                "description": f"Entry-level position focusing on fundamental skills in {career_path['title']} role"
            },
            "mid_level": {
                "title": career_path["title"],
                "duration": "2-5 years",
                "key_skills": career_path.get("key_skills", []),
                "description": f"Mid-level position with broader responsibilities and deeper expertise"
            },
            "senior_level": {
                "title": f"Senior {career_path['title']}",
                "duration": "5+ years",
                "key_skills": career_path.get("key_skills", []) + ["Leadership", "Strategy"],
                "description": f"Senior role focusing on leadership, strategy, and advanced skills"
            },
            "learning_resources": [
                {
                    "title": f"Introduction to {career_path['title']} Role",
                    "platform": "Coursera",
                    "difficulty": "Beginner",
                    "url": "#"
                },
                {
                    "title": f"Advanced {career_path['title']} Skills",
                    "platform": "Udemy",
                    "difficulty": "Intermediate",
                    "url": "#"
                }
            ]
        }
        return jsonify({
            "success": True,
            "career_roadmap": default_roadmap
        }), 200
    
    return jsonify({
        "success": True,
        "career_roadmap": roadmaps[path_id]
    }), 200

# More Flask routes can be added here as needed 