import json
import requests
from typing import List, Dict, Any, Optional
from datetime import datetime
from ..models.job_application_models import JobRole, ApplicationLog
from ..config.env import DEEPSEEK_API_KEY

def generate_top_job_roles(cv_text: str) -> List[Dict[str, Any]]:
    """
    Generate top 25 job roles suitable for the candidate based on their CV
    """
    prompt = f"""Analyze the following CV and identify the top 25 job roles
    that best match the candidate's skills, experience, and background.

    CV DETAILS:
    {cv_text}

    For each job role, provide:
    1. Job Title
    2. Estimated Compatibility Percentage
    3. Key Matching Skills
    4. Potential Career Growth
    5. Recommended Skill Enhancements

    Ranking Criteria:
    - Skill Alignment
    - Experience Relevance
    - Career Potential
    - Industry Trends
    - Skill Transferability

    Output Format:
    [
        {{
            "job_title": "Job Title",
            "compatibility": 85,
            "matching_skills": ["Skill1", "Skill2"],
            "career_growth": "Short description",
            "skill_enhancements": ["Recommendation1", "Recommendation2"]
        }},
        // ... 24 more entries
    ]"""

    try:
        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "deepseek/deepseek-r1:free",
            "messages": [
                {"role": "system", "content": "You are an expert career matching AI that provides comprehensive job role recommendations."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload
        )
        
        if response.status_code == 200:
            result = response.json()
            job_roles = json.loads(result["choices"][0]["message"]["content"])
            return job_roles.get("results", []) if isinstance(job_roles, dict) and "results" in job_roles else job_roles
        else:
            print(f"Error from DeepSeek API: {response.status_code} - {response.text}")
            return []
    except Exception as e:
        print(f"Error generating job roles: {e}")
        return []

def generate_application_strategy(selected_roles: List[str], selected_emirates: List[str]) -> str:
    """Generate comprehensive application strategy"""
    prompt = f"""Create a detailed job application strategy:

    Selected Job Roles: {selected_roles}
    Selected Emirates: {selected_emirates}

    Provide a comprehensive strategy including:
    1. Platform-specific application approach
    2. Networking strategies
    3. CV and cover letter customization tips
    4. Interview preparation recommendations
    5. Platforms to use in UAE:
       - LinkedIn
       - Bayt.com
       - GulfTalent
       - Indeed UAE
       - Naukrigulf
       - Monster Gulf

    Detailed Action Plan:
    - Platform-specific profile optimization
    - Networking techniques
    - Application tracking method
    - Follow-up strategies
    - Skill enhancement recommendations"""

    try:
        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "deepseek/deepseek-r1:free",
            "messages": [
                {"role": "system", "content": "You are an expert career counselor providing a comprehensive job application strategy."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 2000
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
        return f"Error generating application strategy: {e}"

def generate_cover_letter(request: Dict[str, Any]) -> str:
    """
    Generate AI-powered personalized cover letter
    """
    cover_letter_prompt = f"""
    Generate a personalized cover letter based on:

    Job Title: {request.get('job_title', '')}
    Job Description: {request.get('job_description', '')}
    Company: {request.get('company_name', 'the company')}
    
    Candidate Skills: {', '.join(request.get('user_skills', []))}
    Candidate Experience: {request.get('user_experience', '')}

    Requirements:
    - Tailor to specific job description
    - Highlight matching skills
    - Professional and engaging tone
    - Maximum 500 words
    - Include proper salutation and closing
    - No placeholder text - make it ready to use
    """

    try:
        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "deepseek/deepseek-r1:free",
            "messages": [
                {"role": "system", "content": "You are an expert cover letter writer"},
                {"role": "user", "content": cover_letter_prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 800
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
        return f"Cover letter generation error: {e}"

def generate_application_report(application_log: List[ApplicationLog], job_details: Dict[str, Any]) -> str:
    """
    Generate comprehensive application submission report
    """
    report_prompt = f"""
    Analyze the job application submissions:

    Application Log: {application_log}
    Job Details: {job_details}

    Provide:
    - Success probability for each application
    - Recommended follow-up actions and timeline
    - Potential improvements for future applications
    - Specific networking strategies for each platform
    - Additional platforms to consider
    """

    try:
        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "deepseek/deepseek-r1:free",
            "messages": [
                {"role": "system", "content": "You are an expert career counselor analyzing job applications"},
                {"role": "user", "content": report_prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 1000
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
        return f"Report generation error: {e}" 