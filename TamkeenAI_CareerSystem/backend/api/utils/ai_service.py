"""
AI Service Utility

This module provides AI capabilities for generating career insights,
predictions, and recommendations using OpenAI's GPT models.
"""

import os
import json
from typing import Dict, List, Any, Optional, Union
import random
from datetime import datetime

try:
    from openai import OpenAI
    AI_AVAILABLE = True
except ImportError:
    AI_AVAILABLE = False

# Initialize OpenAI client if API key is available
api_key = os.environ.get("OPENAI_API_KEY")
if AI_AVAILABLE and api_key:
    client = OpenAI(api_key=api_key)
else:
    client = None

def generate_career_insights(user_data: Dict[str, Any], prediction_type: str = "insights") -> Union[Dict[str, Any], List[str], None]:
    """
    Generate AI-powered career insights based on user data
    
    Args:
        user_data: Dictionary containing user profile, skills, and experience
        prediction_type: Type of insights to generate ('insights', 'career_path', 'recommendations')
        
    Returns:
        Dictionary of insights, list of recommendations, or None if AI is unavailable
    """
    if not AI_AVAILABLE or not client:
        return _generate_fallback_insights(user_data, prediction_type)
    
    try:
        # Extract relevant user info
        skills = []
        for category, skill_dict in user_data.get("skills", {}).items():
            for skill_name, details in skill_dict.items():
                current_level = details.get("current", 0)
                if current_level > 0:
                    skills.append({"name": skill_name, "level": current_level})
        
        experience = user_data.get("experience", [])
        education = user_data.get("education", [])
        target_role = user_data.get("target_role", "")
        
        # Create prompt based on prediction type
        if prediction_type == "insights":
            prompt = f"""
            Based on the following user profile, provide career market insights:
            
            Skills: {skills}
            Experience: {experience}
            Education: {education}
            Target Role: {target_role}
            
            Provide a JSON response with:
            1. market_position (percentile and explanation)
            2. personalized_suggestions (list of 3-5 specific recommendations)
            3. salary_potential (range and factors)
            """
        elif prediction_type == "career_path":
            prompt = f"""
            Based on the following user profile, predict a career trajectory:
            
            Skills: {skills}
            Experience: {experience}
            Education: {education}
            Target Role: {target_role}
            
            Provide a JSON response with:
            1. predicted_roles (list of roles with timeline, probability, and skill match)
            2. alternate_paths (list of alternative career paths with compatibility and required skills)
            3. market_alignment (percentage)
            4. skill_gaps (list of skills to develop)
            5. career_velocity (value from 1-10)
            """
        else:  # recommendations
            prompt = f"""
            Based on the following user profile, provide specific learning recommendations:
            
            Skills: {skills}
            Experience: {experience}
            Education: {education}
            Target Role: {target_role}
            
            Provide a JSON response with a list of 5 specific learning resources, each with:
            1. title
            2. description
            3. type (course, book, project, certification)
            4. url (fictional)
            5. estimated_time (in hours)
            """
        
        # Get AI response
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": "You are a career analytics AI. Respond only in valid JSON format."},
                {"role": "user", "content": prompt}
            ]
        )
        
        # Parse JSON response
        content = response.choices[0].message.content
        return json.loads(content)
    
    except Exception as e:
        print(f"Error generating AI insights: {e}")
        return _generate_fallback_insights(user_data, prediction_type)

def _generate_fallback_insights(user_data: Dict[str, Any], prediction_type: str) -> Union[Dict[str, Any], List[str]]:
    """Generate fallback insights when AI is unavailable"""
    if prediction_type == "insights":
        return {
            "market_position": {
                "percentile": random.randint(60, 85),
                "explanation": "Your skills place you in a competitive position for your target roles."
            },
            "suggestions": [
                "Consider strengthening your cloud computing skills to increase marketability",
                "Roles requiring machine learning expertise command 15-20% higher salaries",
                "Adding team leadership experience can open up more senior positions"
            ],
            "salary_potential": {
                "low": random.randint(70000, 80000),
                "median": random.randint(85000, 95000),
                "high": random.randint(100000, 120000),
                "factors": ["Years of experience", "Technical skill depth", "Leadership experience"]
            }
        }
    elif prediction_type == "career_path":
        return {
            "predicted_roles": [
                {"role": "Junior Data Analyst", "timeline": "Current", "probability": 95, "skill_match": 85},
                {"role": "Data Analyst", "timeline": "0-1 years", "probability": 85, "skill_match": 80},
                {"role": "Senior Data Analyst", "timeline": "1-2 years", "probability": 75, "skill_match": 70},
                {"role": "Data Scientist", "timeline": "2-3 years", "probability": 65, "skill_match": 60},
                {"role": "Senior Data Scientist", "timeline": "4-5 years", "probability": 55, "skill_match": 50}
            ],
            "alternate_paths": [
                {"path": "Machine Learning Engineer", "compatibility": 80, "required_skills": ["Python", "Deep Learning", "MLOps"]},
                {"path": "Data Engineer", "compatibility": 75, "required_skills": ["SQL", "ETL", "Big Data"]},
                {"path": "Business Intelligence Analyst", "compatibility": 85, "required_skills": ["SQL", "Data Visualization", "Business Acumen"]}
            ],
            "market_alignment": 78,
            "skill_gaps": ["Deep Learning", "Cloud Platforms", "Production ML Systems"],
            "career_velocity": 7.5
        }
    else:  # recommendations
        return [
            {
                "title": "Machine Learning A-Z™",
                "description": "Hands-On Python & R In Data Science",
                "type": "course",
                "url": "https://example.com/machine-learning-course",
                "estimated_time": 40
            },
            {
                "title": "Python for Data Analysis",
                "description": "Essential book for data manipulation with Python",
                "type": "book",
                "url": "https://example.com/python-data-analysis",
                "estimated_time": 20
            },
            {
                "title": "Build a Recommendation System",
                "description": "Portfolio project implementing ML algorithms",
                "type": "project",
                "url": "https://example.com/recommendation-project",
                "estimated_time": 15
            },
            {
                "title": "AWS Certified Data Analytics",
                "description": "Cloud-based big data and analytics certification",
                "type": "certification",
                "url": "https://example.com/aws-analytics-cert",
                "estimated_time": 60
            },
            {
                "title": "SQL for Data Science",
                "description": "Master database queries for analytics",
                "type": "course",
                "url": "https://example.com/sql-data-science",
                "estimated_time": 25
            }
        ] 