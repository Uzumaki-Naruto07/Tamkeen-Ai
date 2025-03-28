"""
Mock data utilities for development and testing
"""

import logging
import random
import json
from datetime import datetime, timedelta
import os

# Configure logging
logger = logging.getLogger(__name__)

def get_mock_dashboard_data(user_id):
    """
    Generate mock dashboard data for development and testing
    
    Args:
        user_id (str): The user ID to generate data for
        
    Returns:
        dict: Mock dashboard data
    """
    logger.info(f"Generating mock dashboard data for user {user_id}")
    
    # Use a consistent seed based on user_id to get reproducible random data
    random.seed(user_id)
    
    # Generate a random completion percentage between 40-90%
    overall_completion = random.randint(40, 90)
    
    # Return mock dashboard data
    return {
        "userProgress": {
            "overall_completion": overall_completion,
            "progress_items": [
                {"name": "Resume Builder", "type": "resume", "progress": random.randint(60, 100)},
                {"name": "Interview Preparation", "type": "interview", "progress": random.randint(30, 80)},
                {"name": "Job Applications", "type": "application", "progress": random.randint(40, 90)},
                {"name": "Networking", "type": "networking", "progress": random.randint(20, 70)}
            ],
            "next_steps": [
                {
                    "name": "Complete your profile",
                    "type": "resume",
                    "description": "Add your work experience and skills",
                    "link": "/profile"
                },
                {
                    "name": "Practice interview questions",
                    "type": "interview",
                    "description": "Try our AI mock interview",
                    "link": "/mock-interview"
                },
                {
                    "name": "Update your resume",
                    "type": "resume",
                    "description": "Optimize your resume for ATS scanning",
                    "link": "/resume-builder"
                },
                {
                    "name": "Apply to matching jobs",
                    "type": "application",
                    "description": f"{random.randint(2, 5)} new job matches available",
                    "link": "/jobs"
                }
            ]
        },
        "careerProgress": {
            "level": random.randint(2, 8),
            "xp": random.randint(800, 2500),
            "nextLevelXp": 3000,
            "recentAchievements": [
                {"title": "Resume Master", "xpGained": 50, "date": (datetime.now() - timedelta(days=random.randint(1, 5))).isoformat()},
                {"title": "Course Completer", "xpGained": 75, "date": (datetime.now() - timedelta(days=random.randint(6, 10))).isoformat()},
                {"title": "Job Hunter", "xpGained": 30, "date": (datetime.now() - timedelta(days=random.randint(11, 15))).isoformat()}
            ]
        },
        "applications": {
            "total": random.randint(8, 15),
            "active": random.randint(3, 7),
            "interviews": random.randint(1, 3),
            "offers": random.randint(0, 1),
            "rejected": random.randint(2, 5)
        },
        "upcomingInterviews": [
            {
                "company": "TechCorp Inc.",
                "position": "Senior Frontend Developer",
                "date": (datetime.now() + timedelta(days=random.randint(1, 4))).replace(hour=14, minute=0).isoformat(),
                "type": "Technical"
            },
            {
                "company": "InnovateSoft",
                "position": "Full Stack Developer",
                "date": (datetime.now() + timedelta(days=random.randint(5, 8))).replace(hour=10, minute=30).isoformat(),
                "type": "Initial"
            }
        ],
        "skills": {
            "top": [
                {"name": "JavaScript", "verified": True},
                {"name": "React", "verified": True},
                {"name": "HTML/CSS", "verified": True},
                {"name": "Node.js", "verified": False},
                {"name": "Python", "verified": False}
            ],
            "inDemand": [
                {"name": "TypeScript"},
                {"name": "AWS"},
                {"name": "Docker"}
            ]
        },
        "resumeScore": {
            "score": random.randint(70, 85),
            "improvement_areas": [
                {"name": "Keywords", "score": random.randint(50, 70), "recommendation": "Add more industry-specific keywords"},
                {"name": "Experience", "score": random.randint(70, 90), "recommendation": "Make achievements more quantifiable"},
                {"name": "Skills", "score": random.randint(80, 95), "recommendation": "Your skills section is well-optimized"},
                {"name": "Format", "score": random.randint(65, 85), "recommendation": "Improve readability with better formatting"}
            ]
        },
        "insights": [
            {"title": "Your React skills are in high demand", "description": "85% of jobs in your field require React experience."},
            {"title": "Consider adding TypeScript", "description": "TypeScript appears in 65% of jobs matching your profile."},
            {"title": "Interview performance improving", "description": "Your mock interview scores increased by 20% in the last month."}
        ]
    }


def get_mock_job_data():
    """
    Generate mock job listing data
    
    Returns:
        dict: Mock job data including listings, applications, recommendations
    """
    # Implementation would go here
    pass


def get_mock_resume_data():
    """
    Generate mock resume data
    
    Returns:
        dict: Mock resume data including ATS analysis
    """
    # Implementation would go here
    pass


def get_mock_skills_data():
    """
    Generate mock skills assessment data
    
    Returns:
        dict: Mock skills data including skill gap analysis
    """
    # Implementation would go here
    pass 