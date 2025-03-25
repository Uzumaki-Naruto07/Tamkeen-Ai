from typing import Dict, List, Any, Optional
import json
import os
import requests
from ..models.user_info_models import UserInfo, PersonalityAssessment, CareerGuidanceRequest
from ..config.env import DEEPSEEK_API_KEY

# Career data (normally this would come from a database)
CAREER_DATA = {
    "Data Scientist": {
        "skills": ["Python", "R", "SQL", "Statistics", "Machine Learning", "Data Visualization"],
        "education": ["Bachelor's in Computer Science", "Master's in Data Science"],
        "salary_range": "$90,000 - $150,000",
        "growth_outlook": "Very High",
        "industries": ["Tech", "Finance", "Healthcare", "Retail"]
    },
    "Software Engineer": {
        "skills": ["Java", "Python", "JavaScript", "C++", "Software Development", "Problem Solving"],
        "education": ["Bachelor's in Computer Science", "Software Engineering Bootcamp"],
        "salary_range": "$80,000 - $140,000",
        "growth_outlook": "High",
        "industries": ["Tech", "Finance", "Gaming", "E-commerce"]
    },
    "UX Designer": {
        "skills": ["UI Design", "User Research", "Wireframing", "Prototyping", "Adobe XD", "Figma"],
        "education": ["Bachelor's in Design", "UX Certificate"],
        "salary_range": "$70,000 - $120,000",
        "growth_outlook": "High",
        "industries": ["Tech", "Advertising", "Consulting", "E-commerce"]
    },
    "Marketing Manager": {
        "skills": ["SEO", "Social Media", "Content Strategy", "Analytics", "Campaign Management"],
        "education": ["Bachelor's in Marketing", "MBA"],
        "salary_range": "$60,000 - $130,000",
        "growth_outlook": "Medium",
        "industries": ["Tech", "Retail", "Healthcare", "Finance"]
    },
    "Financial Analyst": {
        "skills": ["Financial Modeling", "Excel", "Data Analysis", "Reporting", "Forecasting"],
        "education": ["Bachelor's in Finance", "CFA"],
        "salary_range": "$65,000 - $110,000",
        "growth_outlook": "Medium",
        "industries": ["Banking", "Investment", "Corporate Finance", "Consulting"]
    }
}

def match_skills_to_careers(user_skills: List[str]) -> Dict[str, float]:
    """Match user skills to potential careers"""
    career_matches = {}
    
    for career, data in CAREER_DATA.items():
        career_skills = data["skills"]
        matching_skills = set(user_skills).intersection(set(career_skills))
        match_percentage = len(matching_skills) / len(career_skills) * 100
        career_matches[career] = match_percentage
    
    # Sort by match percentage
    sorted_matches = dict(sorted(career_matches.items(), key=lambda x: x[1], reverse=True))
    return sorted_matches

def identify_skill_gaps(user_skills: List[str], career: str) -> List[str]:
    """Identify skill gaps for a specific career"""
    if career not in CAREER_DATA:
        return []
    
    career_skills = CAREER_DATA[career]["skills"]
    missing_skills = [skill for skill in career_skills if skill not in user_skills]
    return missing_skills

def generate_learning_paths(skill_gaps: Dict[str, List[str]]) -> Dict[str, List[Dict[str, Any]]]:
    """Generate learning paths for identified skill gaps"""
    learning_paths = {}
    
    for career, missing_skills in skill_gaps.items():
        career_paths = []
        for skill in missing_skills:
            # This is a simplified example - in a real system, you'd query a learning resources database
            path = {
                "skill": skill,
                "resources": [
                    {"type": "Course", "name": f"Introduction to {skill}", "platform": "Coursera", "duration": "4 weeks"},
                    {"type": "Book", "name": f"{skill} Fundamentals", "author": "Various Experts"},
                    {"type": "Practice", "name": f"{skill} Projects", "description": "Hands-on projects to build portfolio"}
                ],
                "estimated_time": "2-3 months",
                "difficulty": "Intermediate"
            }
            career_paths.append(path)
        learning_paths[career] = career_paths
    
    return learning_paths

def generate_career_timeline(user_info: UserInfo, target_career: str) -> List[Dict[str, Any]]:
    """Generate a realistic career timeline for the user"""
    # Starting point based on user's current experience
    experience_years = user_info.work_experience_years or 0
    
    timeline = []
    
    # Current position or education
    if experience_years == 0:
        timeline.append({
            "year": "Present",
            "title": "Education/Training",
            "description": f"Complete {user_info.education_level} in {user_info.field_of_study or 'relevant field'}"
        })
    else:
        timeline.append({
            "year": "Present",
            "title": "Current Position",
            "description": "Continue building experience in current role while developing new skills"
        })
    
    # Identify missing skills
    missing_skills = identify_skill_gaps(user_info.skills, target_career)
    
    # Skill development phase
    timeline.append({
        "year": "0-6 months",
        "title": "Skill Development",
        "description": f"Focus on acquiring key skills: {', '.join(missing_skills[:3])}"
    })
    
    # Entry or transition position
    timeline.append({
        "year": "6-12 months",
        "title": "Entry/Transition Position",
        "description": f"Secure an entry-level or transitional role related to {target_career}"
    })
    
    # Further skill development
    if len(missing_skills) > 3:
        timeline.append({
            "year": "1-2 years",
            "title": "Advanced Skill Development",
            "description": f"Master additional skills: {', '.join(missing_skills[3:])}"
        })
    
    # Target career achievement
    timeline.append({
        "year": "2-3 years",
        "title": f"{target_career} Role",
        "description": f"Transition fully into a {target_career} position with competitive compensation"
    })
    
    # Future growth
    timeline.append({
        "year": "3-5 years",
        "title": "Career Growth",
        "description": f"Advance to senior {target_career} roles with increased responsibilities and compensation"
    })
    
    return timeline

def get_personalized_guidance_llm(request_data: Dict[str, Any]) -> str:
    """Get personalized career guidance using DeepSeek LLM"""
    if not DEEPSEEK_API_KEY:
        return "DeepSeek API key not configured. Please add it to the environment variables."
    
    # Create a detailed prompt for the LLM
    prompt = f"""You are an expert career counselor providing detailed guidance.
Please analyze this person's profile and provide personalized career advice:

NAME: {request_data['user_info']['name']}
AGE: {request_data['user_info'].get('age', 'Not specified')}
EDUCATION: {request_data['user_info']['education_level']} in {request_data['user_info'].get('field_of_study', 'Not specified')}
EXPERIENCE: {request_data['user_info'].get('work_experience_years', 0)} years
SKILLS: {', '.join(request_data['user_info']['skills'])}
INTERESTS: {', '.join(request_data['user_info']['interests'])}
PERSONALITY: {', '.join(request_data['user_info'].get('personality_traits', ['Not specified']))}
CAREER GOALS: {request_data['user_info'].get('career_goals', 'Not specified')}
PREFERRED WORK ENVIRONMENT: {request_data['user_info'].get('preferred_work_environment', 'Not specified')}
LOCATION: {request_data['user_info'].get('location', 'Not specified')}

Based on this profile, please provide:

1. CAREER PATH RECOMMENDATIONS: Top 3 career paths that match their profile with specific reasoning.
2. SKILL DEVELOPMENT: Key skills to develop for each recommended career path.
3. EDUCATION SUGGESTIONS: Specific educational paths or certifications to pursue.
4. PERSONALIZED STRATEGY: A realistic 1-year plan to make progress in their career transition.
5. WORK-LIFE CONSIDERATIONS: How their preferred work environment and personality align with recommendations.

For each recommendation, include:
- Why it fits their background and interests
- Expected challenges and how to overcome them
- Realistic timeline and milestones
- First steps to take immediately

Provide actionable, specific, and motivational guidance that helps them make concrete progress toward their goals."""

    try:
        # OpenRouter API integration for DeepSeek access
        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "deepseek/deepseek-r1:free",
            "messages": [
                {"role": "system", "content": "You are an expert career counselor providing detailed, personalized career guidance."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 1500
        }
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload
        )
        
        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["message"]["content"]
        else:
            return f"Error from DeepSeek API: {response.status_code} - {response.text}"
    except Exception as e:
        return f"Error generating personalized guidance: {str(e)}"

def provide_career_guidance(request: CareerGuidanceRequest) -> Dict[str, Any]:
    """Provide comprehensive career guidance based on user information"""
    # 1. Match skills to careers
    career_matches = match_skills_to_careers(request.user_info.skills)
    top_careers = dict(list(career_matches.items())[:5])  # Top 5 matches
    
    # 2. Identify skill gaps for top careers
    skill_gaps = {}
    for career in top_careers.keys():
        skill_gaps[career] = identify_skill_gaps(request.user_info.skills, career)
    
    # 3. Generate learning paths for skill gaps
    learning_paths = generate_learning_paths(skill_gaps)
    
    # 4. Generate career timeline for top career
    top_career = list(top_careers.keys())[0]
    timeline = generate_career_timeline(request.user_info, top_career)
    
    # 5. Get personalized guidance from LLM if available
    personalized_advice = get_personalized_guidance_llm(request.dict())
    
    # 6. Prepare response
    recommended_careers = [
        {
            "title": career,
            "match_percentage": match,
            "skills_required": CAREER_DATA.get(career, {}).get("skills", []),
            "education_paths": CAREER_DATA.get(career, {}).get("education", []),
            "salary_range": CAREER_DATA.get(career, {}).get("salary_range", ""),
            "growth_outlook": CAREER_DATA.get(career, {}).get("growth_outlook", "")
        }
        for career, match in top_careers.items()
    ]
    
    skill_gaps_formatted = [
        {
            "career": career,
            "missing_skills": missing
        }
        for career, missing in skill_gaps.items()
    ]
    
    learning_paths_formatted = [
        {
            "career": career,
            "paths": paths
        }
        for career, paths in learning_paths.items()
    ]
    
    return {
        "recommended_careers": recommended_careers,
        "skill_gaps": skill_gaps_formatted,
        "learning_paths": learning_paths_formatted,
        "career_timeline": timeline,
        "personalized_advice": personalized_advice
    } 