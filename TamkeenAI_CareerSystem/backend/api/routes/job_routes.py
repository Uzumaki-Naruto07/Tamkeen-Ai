"""
Job Routes Module

This module provides API routes for job search, recommendations, and applications.
"""

import logging
from flask import Blueprint, request, jsonify, g
from datetime import datetime, timedelta
import random
import json
import os
import uuid

# Import utilities
from api.utils.date_utils import now

# Import database models
from api.database.models import Job, JobApplication, User, Resume

# Import core modules
from api.core.job_matching import JobMatcher

# Import auth decorators
from api.app import require_auth, require_role

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint
job_bp = Blueprint('job', __name__)

# Create job matcher
job_matcher = JobMatcher()

# Mock job data storage
MOCK_JOBS = [
    {
        "id": "job-001",
        "title": "Senior Frontend Developer",
        "company": "TechVision Inc.",
        "location": "San Francisco, CA",
        "salary_range": {"min": 120000, "max": 160000, "currency": "USD"},
        "job_type": "Full-time",
        "remote": True,
        "description": "We're looking for a Senior Frontend Developer with expertise in React, TypeScript, and modern web technologies to join our product development team.",
        "requirements": [
            "5+ years of experience in frontend development",
            "Strong expertise in React.js and TypeScript",
            "Experience with state management (Redux, Context API)",
            "Proficiency in modern CSS and responsive design",
            "Knowledge of testing frameworks (Jest, React Testing Library)"
        ],
        "benefits": [
            "Competitive salary and equity",
            "Health, dental, and vision insurance",
            "Flexible work hours and remote options",
            "Professional development budget",
            "Generous paid time off"
        ],
        "skills": ["React", "TypeScript", "JavaScript", "CSS", "HTML", "Redux", "Jest", "Responsive Design"],
        "education": ["Bachelor's in Computer Science or related field"],
        "experience_level": "Senior",
        "date_posted": (datetime.now() - timedelta(days=5)).isoformat(),
        "application_deadline": (datetime.now() + timedelta(days=25)).isoformat()
    },
    {
        "id": "job-002",
        "title": "Data Scientist",
        "company": "AnalyticsPro",
        "location": "New York, NY",
        "salary_range": {"min": 110000, "max": 150000, "currency": "USD"},
        "job_type": "Full-time",
        "remote": True,
        "description": "Join our data science team to build predictive models and drive business decisions through data analysis.",
        "requirements": [
            "3+ years of experience in data science or related field",
            "Strong proficiency in Python and data manipulation libraries",
            "Experience with machine learning frameworks (scikit-learn, TensorFlow)",
            "Knowledge of SQL and database systems",
            "Strong statistical analysis skills"
        ],
        "benefits": [
            "Competitive compensation package",
            "Comprehensive health benefits",
            "Flexible work arrangements",
            "Continuing education opportunities",
            "Regular team events and activities"
        ],
        "skills": ["Python", "Machine Learning", "SQL", "TensorFlow", "Data Analysis", "Statistics", "Pandas", "NumPy"],
        "education": ["Master's or PhD in Computer Science, Statistics, or related field"],
        "experience_level": "Mid-Senior",
        "date_posted": (datetime.now() - timedelta(days=8)).isoformat(),
        "application_deadline": (datetime.now() + timedelta(days=22)).isoformat()
    },
    {
        "id": "job-003",
        "title": "Full Stack Developer",
        "company": "WebSolutions Ltd.",
        "location": "Austin, TX",
        "salary_range": {"min": 95000, "max": 130000, "currency": "USD"},
        "job_type": "Full-time",
        "remote": True,
        "description": "We're seeking a talented Full Stack Developer to join our growing team. You'll work on various projects from conception to deployment.",
        "requirements": [
            "3+ years of experience in full stack development",
            "Proficiency in JavaScript/TypeScript and modern frameworks",
            "Experience with Node.js and RESTful APIs",
            "Knowledge of database design and ORM frameworks",
            "Familiarity with cloud services (AWS, Azure, or GCP)"
        ],
        "benefits": [
            "Competitive salary",
            "Health insurance",
            "Unlimited PTO",
            "401(k) matching",
            "Professional growth opportunities"
        ],
        "skills": ["JavaScript", "TypeScript", "Node.js", "React", "MongoDB", "Express", "RESTful API", "Git"],
        "education": ["Bachelor's in Computer Science or equivalent experience"],
        "experience_level": "Mid",
        "date_posted": (datetime.now() - timedelta(days=3)).isoformat(),
        "application_deadline": (datetime.now() + timedelta(days=27)).isoformat()
    },
    {
        "id": "job-004",
        "title": "UX/UI Designer",
        "company": "DesignHub Creative",
        "location": "Chicago, IL",
        "salary_range": {"min": 85000, "max": 120000, "currency": "USD"},
        "job_type": "Full-time",
        "remote": True,
        "description": "Join our design team to create beautiful, intuitive interfaces for web and mobile applications.",
        "requirements": [
            "3+ years of UX/UI design experience",
            "Proficiency in design tools (Figma, Sketch, Adobe XD)",
            "Strong portfolio demonstrating UI design skills",
            "Experience with user research and usability testing",
            "Knowledge of design systems and component libraries"
        ],
        "benefits": [
            "Competitive salary",
            "Comprehensive benefits package",
            "Flexible work arrangements",
            "Creative environment",
            "Professional development opportunities"
        ],
        "skills": ["UI Design", "UX Design", "Figma", "Sketch", "User Research", "Wireframing", "Prototyping", "Design Systems"],
        "education": ["Bachelor's in Design, HCI, or related field"],
        "experience_level": "Mid",
        "date_posted": (datetime.now() - timedelta(days=7)).isoformat(),
        "application_deadline": (datetime.now() + timedelta(days=23)).isoformat()
    },
    {
        "id": "job-005",
        "title": "DevOps Engineer",
        "company": "CloudTech Solutions",
        "location": "Seattle, WA",
        "salary_range": {"min": 115000, "max": 155000, "currency": "USD"},
        "job_type": "Full-time",
        "remote": True,
        "description": "We're looking for a DevOps Engineer to help build and maintain our cloud infrastructure and CI/CD pipelines.",
        "requirements": [
            "4+ years of experience in DevOps or similar role",
            "Strong knowledge of cloud platforms (AWS, Azure, or GCP)",
            "Experience with containerization and orchestration (Docker, Kubernetes)",
            "Familiarity with infrastructure as code (Terraform, CloudFormation)",
            "Proficiency in scripting languages (Python, Bash)"
        ],
        "benefits": [
            "Competitive salary and bonuses",
            "Comprehensive health benefits",
            "Remote work options",
            "Professional development budget",
            "Stock options"
        ],
        "skills": ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Python", "Linux", "Monitoring"],
        "education": ["Bachelor's in Computer Science or equivalent experience"],
        "experience_level": "Mid-Senior",
        "date_posted": (datetime.now() - timedelta(days=10)).isoformat(),
        "application_deadline": (datetime.now() + timedelta(days=20)).isoformat()
    }
]

# Mock job applications
MOCK_APPLICATIONS = {}

def calculate_job_match(user_skills, job_skills, user_experience, job_experience_level):
    """
    Calculate job match percentage based on skills and experience
    """
    if not user_skills:
        user_skills = []
    
    # Calculate skill match
    total_job_skills = len(job_skills)
    if total_job_skills == 0:
        skill_match = 0.5  # Default value if no job skills specified
    else:
        # Count matching skills
        matching_skills = sum(1 for skill in job_skills if skill.lower() in [s.lower() for s in user_skills])
        skill_match = matching_skills / total_job_skills
    
    # Calculate experience match
    experience_levels = {
        "Entry": 1,
        "Junior": 2,
        "Mid": 3,
        "Senior": 4,
        "Lead": 5
    }
    
    user_exp_value = 0
    job_exp_value = 0
    
    # Convert string years to numeric value
    if isinstance(user_experience, str) and "year" in user_experience.lower():
        try:
            years = int(user_experience.split()[0])
            if years <= 1:
                user_exp_value = 1
            elif years <= 3:
                user_exp_value = 2
            elif years <= 5:
                user_exp_value = 3
            elif years <= 8:
                user_exp_value = 4
            else:
                user_exp_value = 5
        except:
            user_exp_value = 3  # Default if parsing fails
    # Handle numeric years
    elif isinstance(user_experience, (int, float)):
        years = user_experience
        if years <= 1:
            user_exp_value = 1
        elif years <= 3:
            user_exp_value = 2
        elif years <= 5:
            user_exp_value = 3
        elif years <= 8:
            user_exp_value = 4
        else:
            user_exp_value = 5
    # Handle level strings
    elif user_experience in experience_levels:
        user_exp_value = experience_levels[user_experience]
    else:
        user_exp_value = 3  # Default mid-level if not specified
    
    # Get job experience value
    if job_experience_level in experience_levels:
        job_exp_value = experience_levels[job_experience_level]
    else:
        job_exp_value = 3  # Default mid-level
    
    # Calculate experience match (closer the values, better the match)
    exp_difference = abs(user_exp_value - job_exp_value)
    if exp_difference == 0:
        exp_match = 1.0
    elif exp_difference == 1:
        exp_match = 0.8
    elif exp_difference == 2:
        exp_match = 0.6
    else:
        exp_match = 0.4
    
    # Calculate overall match (prioritize skill match slightly more)
    overall_match = (skill_match * 0.6) + (exp_match * 0.4)
    return round(overall_match * 100)  # Convert to percentage

@job_bp.route('/search', methods=['GET'])
def search_jobs():
    """
    Search for jobs with optional filters
    """
    # Parse query parameters
    query = request.args.get('query', '')
    location = request.args.get('location', '')
    remote = request.args.get('remote', '').lower() == 'true'
    job_type = request.args.get('job_type', '')
    experience_level = request.args.get('experience_level', '')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    
    # Filter jobs based on query parameters
    filtered_jobs = MOCK_JOBS.copy()
    
    # Filter by search query (search in title, description, and skills)
    if query:
        query_lower = query.lower()
        filtered_jobs = [
            job for job in filtered_jobs if 
            query_lower in job['title'].lower() or 
            query_lower in job['description'].lower() or
            any(query_lower in skill.lower() for skill in job['skills'])
        ]
    
    # Filter by location
    if location:
        location_lower = location.lower()
        filtered_jobs = [
            job for job in filtered_jobs if 
            location_lower in job['location'].lower()
        ]
    
    # Filter by remote option
    if remote:
        filtered_jobs = [job for job in filtered_jobs if job['remote']]
    
    # Filter by job type
    if job_type:
        filtered_jobs = [
            job for job in filtered_jobs if 
            job_type.lower() == job['job_type'].lower()
        ]
    
    # Filter by experience level
    if experience_level:
        filtered_jobs = [
            job for job in filtered_jobs if 
            experience_level.lower() in job['experience_level'].lower()
        ]
    
    # Calculate total results
    total_results = len(filtered_jobs)
    
    # Paginate results
    start_index = (page - 1) * limit
    end_index = start_index + limit
    paginated_jobs = filtered_jobs[start_index:end_index]
    
    return jsonify({
        "success": True,
        "jobs": paginated_jobs,
        "total": total_results,
        "page": page,
        "limit": limit,
        "total_pages": (total_results + limit - 1) // limit  # Ceiling division
    }), 200

@job_bp.route('/<job_id>', methods=['GET'])
def get_job(job_id):
    """
    Get details for a specific job
    """
    job = next((job for job in MOCK_JOBS if job['id'] == job_id), None)
    
    if not job:
        return jsonify({
            "success": False,
            "error": "Job not found"
        }), 404
    
    return jsonify({
        "success": True,
        "job": job
    }), 200

@job_bp.route('/recommend', methods=['POST'])
def recommend_jobs():
    """
    Recommend jobs based on user profile
    """
    data = request.json
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    user_id = data.get('user_id', 'anonymous')
    resume_text = data.get('resume_text', '')
    user_skills = data.get('skills', [])
    user_experience = data.get('experience', 'Mid')
    location_preference = data.get('location_preference', '')
    remote_preference = data.get('remote_preference', False)
    
    # Process all jobs and calculate match score
    recommended_jobs = []
    
    for job in MOCK_JOBS:
        # Calculate match score
        match_score = calculate_job_match(
            user_skills, 
            job['skills'], 
            user_experience, 
            job['experience_level']
        )
        
        # Add location bonus if it matches user preference
        if location_preference and location_preference.lower() in job['location'].lower():
            match_score = min(match_score + 10, 100)
        
        # Add remote work bonus if it matches user preference
        if remote_preference and job['remote']:
            match_score = min(match_score + 5, 100)
        
        # Create job recommendation with match score
        job_with_score = job.copy()
        job_with_score['match_percentage'] = match_score
        recommended_jobs.append(job_with_score)
    
    # Sort by match score (descending)
    recommended_jobs.sort(key=lambda x: x['match_percentage'], reverse=True)
    
    return jsonify({
        "success": True,
        "recommendations": recommended_jobs[:10],  # Top 10 recommendations
        "total_matches": len(recommended_jobs),
        "timestamp": datetime.now().isoformat()
    }), 200

@job_bp.route('/apply', methods=['POST'])
def apply_for_job():
    """
    Apply for a job
    """
    data = request.json
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    user_id = data.get('user_id', 'anonymous')
    job_id = data.get('job_id')
    resume_id = data.get('resume_id')
    cover_letter = data.get('cover_letter', '')
    
    if not job_id:
        return jsonify({"error": "Job ID is required"}), 400
    
    # Check if job exists
    job = next((job for job in MOCK_JOBS if job['id'] == job_id), None)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    
    # Check if user has already applied
    user_applications = MOCK_APPLICATIONS.get(user_id, [])
    if any(app['job_id'] == job_id for app in user_applications):
        return jsonify({"error": "You have already applied for this job"}), 400
    
    # Create application
    application = {
        "id": str(uuid.uuid4()),
        "job_id": job_id,
        "user_id": user_id,
        "resume_id": resume_id,
        "cover_letter": cover_letter,
        "status": "applied",
        "application_date": datetime.now().isoformat(),
        "notes": [],
        "job_title": job["title"],
        "company": job["company"]
    }
    
    # Store application
    if user_id not in MOCK_APPLICATIONS:
        MOCK_APPLICATIONS[user_id] = []
    
    MOCK_APPLICATIONS[user_id].append(application)
    
    return jsonify({
        "success": True,
        "message": "Application submitted successfully",
        "application_id": application["id"],
        "application_date": application["application_date"]
    }), 201

@job_bp.route('/applications/<user_id>', methods=['GET'])
def get_user_applications(user_id):
    """
    Get applications for a user
    """
    if user_id not in MOCK_APPLICATIONS or not MOCK_APPLICATIONS[user_id]:
        return jsonify({
            "success": True,
            "applications": []
        }), 200
    
    return jsonify({
        "success": True,
        "applications": MOCK_APPLICATIONS[user_id]
    }), 200

@job_bp.route('/application/<application_id>', methods=['GET'])
def get_application(application_id):
    """
    Get details for a specific application
    """
    # Find application across all users
    for user_id, applications in MOCK_APPLICATIONS.items():
        application = next((app for app in applications if app['id'] == application_id), None)
        if application:
            # Get job details
            job = next((job for job in MOCK_JOBS if job['id'] == application['job_id']), None)
            
            response = {
                "success": True,
                "application": application
            }
            
            if job:
                response["job"] = job
            
            return jsonify(response), 200
    
    return jsonify({
        "success": False,
        "error": "Application not found"
    }), 404

@job_bp.route('/application/<application_id>/status', methods=['PUT'])
def update_application_status(application_id):
    """
    Update application status
    """
    data = request.json
    
    if not data or 'status' not in data:
        return jsonify({"error": "Status is required"}), 400
    
    new_status = data['status']
    valid_statuses = ['applied', 'rejected', 'interview', 'offer', 'accepted', 'withdrawn']
    
    if new_status not in valid_statuses:
        return jsonify({"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}), 400
    
    # Find and update application
    for user_id, applications in MOCK_APPLICATIONS.items():
        for i, app in enumerate(applications):
            if app['id'] == application_id:
                MOCK_APPLICATIONS[user_id][i]['status'] = new_status
                MOCK_APPLICATIONS[user_id][i]['status_updated'] = datetime.now().isoformat()
                
                if 'notes' in data:
                    note = {
                        "text": data['notes'],
                        "timestamp": datetime.now().isoformat()
                    }
                    MOCK_APPLICATIONS[user_id][i]['notes'].append(note)
                
                return jsonify({
                    "success": True,
                    "message": "Application status updated",
                    "application_id": application_id,
                    "new_status": new_status
                }), 200
    
    return jsonify({
        "success": False,
        "error": "Application not found"
    }), 404

@job_bp.route('/stats/<user_id>', methods=['GET'])
def get_job_stats(user_id):
    """
    Get job application statistics for a user
    """
    user_applications = MOCK_APPLICATIONS.get(user_id, [])
    
    # Calculate statistics
    total_applications = len(user_applications)
    
    status_counts = {
        "applied": 0,
        "rejected": 0,
        "interview": 0,
        "offer": 0,
        "accepted": 0,
        "withdrawn": 0
    }
    
    for app in user_applications:
        status = app.get('status', 'applied')
        if status in status_counts:
            status_counts[status] += 1
    
    # Calculate success rate
    interviews = status_counts["interview"] + status_counts["offer"] + status_counts["accepted"]
    success_rate = (interviews / total_applications) * 100 if total_applications > 0 else 0
    
    # Calculate monthly applications
    monthly_applications = {}
    for app in user_applications:
        app_date = app.get('application_date', '')
        if app_date:
            try:
                date_obj = datetime.fromisoformat(app_date)
                month_key = date_obj.strftime('%Y-%m')
                
                if month_key not in monthly_applications:
                    monthly_applications[month_key] = 0
                
                monthly_applications[month_key] += 1
            except:
                pass
    
    # Convert monthly applications to sorted list
    monthly_data = [
        {"month": month, "applications": count}
        for month, count in sorted(monthly_applications.items())
    ]
    
    return jsonify({
        "success": True,
        "user_id": user_id,
        "total_applications": total_applications,
        "status_counts": status_counts,
        "success_rate": round(success_rate, 2),
        "monthly_data": monthly_data
    }), 200

@job_bp.route('/market-insights', methods=['GET'])
def get_market_insights():
    """
    Get job market insights
    """
    # Mock data for different job categories
    insights = {
        "top_roles": [
            {"title": "Software Developer", "demand_score": 85, "avg_salary": 110000},
            {"title": "Data Scientist", "demand_score": 82, "avg_salary": 120000},
            {"title": "DevOps Engineer", "demand_score": 80, "avg_salary": 125000},
            {"title": "UX Designer", "demand_score": 75, "avg_salary": 95000},
            {"title": "Product Manager", "demand_score": 78, "avg_salary": 115000}
        ],
        "skill_demand": [
            {"skill": "React", "change": 15, "trending": True},
            {"skill": "Python", "change": 12, "trending": True},
            {"skill": "AWS", "change": 18, "trending": True},
            {"skill": "Machine Learning", "change": 20, "trending": True},
            {"skill": "TypeScript", "change": 25, "trending": True},
            {"skill": "Docker", "change": 15, "trending": True},
            {"skill": "Kubernetes", "change": 22, "trending": True},
            {"skill": "React Native", "change": 14, "trending": True}
        ],
        "salary_ranges": {
            "Entry Level": {"min": 60000, "max": 85000, "median": 70000},
            "Mid Level": {"min": 85000, "max": 120000, "median": 100000},
            "Senior Level": {"min": 120000, "max": 180000, "median": 140000},
            "Lead/Manager": {"min": 140000, "max": 220000, "median": 170000}
        },
        "industry_growth": [
            {"industry": "Technology", "growth_rate": 12, "job_openings": 50000},
            {"industry": "Healthcare", "growth_rate": 9, "job_openings": 35000},
            {"industry": "Finance", "growth_rate": 7, "job_openings": 30000},
            {"industry": "E-commerce", "growth_rate": 15, "job_openings": 25000},
            {"industry": "Education", "growth_rate": 5, "job_openings": 18000}
        ],
        "remote_work": {
            "remote_percentage": 35,
            "hybrid_percentage": 45,
            "onsite_percentage": 20,
            "trend": "increasing"
        }
    }
    
    return jsonify({
        "success": True,
        "insights": insights,
        "timestamp": datetime.now().isoformat()
    }), 200 