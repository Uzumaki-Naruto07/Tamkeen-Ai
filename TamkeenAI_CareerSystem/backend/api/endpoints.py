"""
API Endpoints Module

This module defines the RESTful API endpoints for the Tamkeen AI Career Intelligence System.
"""

import os
import json
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
import uuid

# Import flask components
from flask import Blueprint, request, jsonify, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, create_refresh_token

# Import core modules
from backend.core.resume_parser import parse_resume, extract_text_from_resume
from backend.core.ats_matcher import analyze_resume
from backend.core.keyword_recommender import recommend_skills, extract_keywords, get_missing_job_keywords
from backend.core.career_assessment import create_assessment, evaluate_assessment, assess_career_readiness
from backend.core.career_guidance import get_career_path, get_salary_information, create_career_development_plan
from backend.core.career_path_visualizer import create_path_visualization, create_skill_network
from backend.core.feedback_engine import generate_resume_feedback, generate_career_advice
from backend.core.interview_simulator import generate_interview_questions, evaluate_interview_response
from backend.core.report_generator import generate_resume_analysis_report, generate_career_assessment_report
from backend.core.analytics_engine import track_user_event, get_user_activity_summary

# Import database models
from backend.database.models import User, ResumeProfile, CareerAssessment, UserSkill, UserActivity

# Import config
from backend.config.settings import UPLOAD_FOLDER, API_PREFIX

# Import utilities
from backend.utils.file_utils import allowed_file, save_uploaded_file
from backend.utils.response import api_response, error_response

# Create blueprint for API routes
api = Blueprint('api', __name__, url_prefix=API_PREFIX)


# User endpoints
@api.route('/users/register', methods=['POST'])
def register_user():
    """Register a new user"""
    data = request.get_json()
    
    # Validate input
    required_fields = ['email', 'password', 'first_name', 'last_name']
    for field in required_fields:
        if field not in data:
            return error_response(f"Missing required field: {field}", 400)
    
    # Check if user already exists
    if User.find_by_email(data['email']):
        return error_response("User with this email already exists", 409)
    
    # Create new user
    try:
        new_user = User(
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name']
        )
        new_user.set_password(data['password'])
        new_user.save()
        
        # Generate tokens
        access_token = create_access_token(identity=new_user.id)
        refresh_token = create_refresh_token(identity=new_user.id)
        
        # Track registration
        track_user_event(new_user.id, "user_registered", {
            "timestamp": datetime.now().isoformat()
        })
        
        return api_response({
            "message": "User registered successfully",
            "user_id": new_user.id,
            "access_token": access_token,
            "refresh_token": refresh_token
        }, 201)
    
    except Exception as e:
        current_app.logger.error(f"Error registering user: {str(e)}")
        return error_response("Error registering user", 500)


@api.route('/users/login', methods=['POST'])
def login_user():
    """Login existing user"""
    data = request.get_json()
    
    # Validate input
    if 'email' not in data or 'password' not in data:
        return error_response("Missing email or password", 400)
    
    # Find user
    user = User.find_by_email(data['email'])
    if not user or not user.check_password(data['password']):
        return error_response("Invalid email or password", 401)
    
    # Generate tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    # Track login
    track_user_event(user.id, "user_logged_in", {
        "timestamp": datetime.now().isoformat()
    })
    
    return api_response({
        "message": "Login successful",
        "user_id": user.id,
        "access_token": access_token,
        "refresh_token": refresh_token
    })


@api.route('/users/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    """Get current user profile"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return error_response("User not found", 404)
    
    # Get additional user data
    resume_profiles = ResumeProfile.find_by_user_id(user_id)
    assessments = CareerAssessment.find_by_user_id(user_id)
    skills = UserSkill.find_by_user_id(user_id)
    activity = get_user_activity_summary(user_id, days=30)
    
    # Track profile view
    track_user_event(user_id, "profile_viewed", {
        "timestamp": datetime.now().isoformat()
    })
    
    return api_response({
        "user": user.to_dict(),
        "resumes": [profile.to_dict() for profile in resume_profiles],
        "assessments": [assessment.to_dict() for assessment in assessments],
        "skills": [skill.to_dict() for skill in skills],
        "recent_activity": activity
    })


@api.route('/users/profile', methods=['PUT'])
@jwt_required()
def update_user_profile():
    """Update user profile"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return error_response("User not found", 404)
    
    data = request.get_json()
    updateable_fields = ['first_name', 'last_name', 'job_title', 'industry', 
                         'years_experience', 'education_level', 'location']
    
    # Update fields
    updates = {}
    for field in updateable_fields:
        if field in data:
            setattr(user, field, data[field])
            updates[field] = data[field]
    
    # Update password if provided
    if 'password' in data and data['password']:
        user.set_password(data['password'])
        updates['password'] = '********'
    
    user.updated_at = datetime.now()
    user.save()
    
    # Track profile update
    track_user_event(user_id, "profile_updated", {
        "timestamp": datetime.now().isoformat(),
        "updated_fields": list(updates.keys())
    })
    
    return api_response({
        "message": "Profile updated successfully",
        "updated_fields": list(updates.keys())
    })


# Resume analysis endpoints
@api.route('/resumes/upload', methods=['POST'])
@jwt_required()
def upload_resume():
    """Upload and analyze resume"""
    user_id = get_jwt_identity()
    
    # Check if file is in request
    if 'file' not in request.files:
        return error_response("No file provided", 400)
    
    file = request.files['file']
    if file.filename == '':
        return error_response("No file selected", 400)
    
    if not allowed_file(file.filename, ['pdf', 'docx', 'txt']):
        return error_response("File type not allowed. Please upload PDF, DOCX or TXT", 400)
    
    # Save file
    file_path = save_uploaded_file(file, user_id)
    if not file_path:
        return error_response("Error saving file", 500)
    
    # Parse resume
    try:
        parsed_resume = parse_resume(file_path)
        
        # Get job description if provided
        job_description = None
        if 'job_description' in request.form:
            job_description = request.form['job_description']
        
        # Analyze for ATS compatibility
        analysis = analyze_resume(file_path, job_description)
        
        # Save resume profile
        resume_profile = ResumeProfile(
            user_id=user_id,
            file_path=file_path,
            file_name=file.filename,
            parsed_data=json.dumps(parsed_resume),
            analysis=json.dumps(analysis)
        )
        resume_profile.save()
        
        # Track resume upload
        track_user_event(user_id, "resume_uploaded", {
            "timestamp": datetime.now().isoformat(),
            "file_name": file.filename,
            "overall_score": analysis.get("overall_score", 0)
        })
        
        return api_response({
            "message": "Resume uploaded and analyzed successfully",
            "resume_id": resume_profile.id,
            "parsed_resume": parsed_resume,
            "analysis": analysis
        })
    
    except Exception as e:
        current_app.logger.error(f"Error analyzing resume: {str(e)}")
        return error_response(f"Error analyzing resume: {str(e)}", 500)


@api.route('/resumes/<resume_id>/analyze', methods=['POST'])
@jwt_required()
def analyze_resume_for_job(resume_id):
    """Analyze resume for a specific job"""
    user_id = get_jwt_identity()
    
    # Find resume
    resume_profile = ResumeProfile.find_by_id(resume_id)
    if not resume_profile or resume_profile.user_id != user_id:
        return error_response("Resume not found", 404)
    
    # Get job description
    data = request.get_json()
    if 'job_description' not in data or not data['job_description']:
        return error_response("Job description required", 400)
    
    job_description = data['job_description']
    job_title = data.get('job_title', 'Not specified')
    
    # Analyze resume
    try:
        analysis = analyze_resume(resume_profile.file_path, job_description)
        
        # Update resume profile
        resume_profile.job_match_data = json.dumps({
            "job_title": job_title,
            "job_description": job_description,
            "analysis": analysis,
            "analyzed_at": datetime.now().isoformat()
        })
        resume_profile.save()
        
        # Generate feedback
        feedback = generate_resume_feedback(analysis, job_title, job_description)
        
        # Track resume analysis
        track_user_event(user_id, "resume_analyzed", {
            "timestamp": datetime.now().isoformat(),
            "resume_id": resume_id,
            "job_title": job_title,
            "match_score": analysis.get("overall_score", 0)
        })
        
        return api_response({
            "message": "Resume analyzed for job successfully",
            "analysis": analysis,
            "feedback": feedback
        })
    
    except Exception as e:
        current_app.logger.error(f"Error analyzing resume for job: {str(e)}")
        return error_response(f"Error analyzing resume: {str(e)}", 500)


@api.route('/resumes/<resume_id>/report', methods=['GET'])
@jwt_required()
def generate_resume_report(resume_id):
    """Generate PDF report for resume analysis"""
    user_id = get_jwt_identity()
    
    # Find resume
    resume_profile = ResumeProfile.find_by_id(resume_id)
    if not resume_profile or resume_profile.user_id != user_id:
        return error_response("Resume not found", 404)
    
    # Get analysis data
    analysis_data = {}
    if resume_profile.analysis:
        analysis_data = json.loads(resume_profile.analysis)
    
    job_title = None
    if resume_profile.job_match_data:
        job_match = json.loads(resume_profile.job_match_data)
        job_title = job_match.get("job_title")
    
    # Generate report
    try:
        report_path = generate_resume_analysis_report(user_id, analysis_data, job_title)
        
        if not report_path or not os.path.exists(report_path):
            return error_response("Error generating report", 500)
        
        # Track report generation
        track_user_event(user_id, "report_generated", {
            "timestamp": datetime.now().isoformat(),
            "report_type": "resume_analysis",
            "resume_id": resume_id
        })
        
        return send_file(
            report_path,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"Resume_Analysis_Report_{datetime.now().strftime('%Y%m%d')}.pdf"
        )
    
    except Exception as e:
        current_app.logger.error(f"Error generating resume report: {str(e)}")
        return error_response(f"Error generating report: {str(e)}", 500)


# Career assessment endpoints
@api.route('/assessments/create', methods=['GET'])
@jwt_required()
def create_new_assessment():
    """Create a new career assessment"""
    user_id = get_jwt_identity()
    
    try:
        assessment_data = create_assessment(user_id)
        
        # Save to database
        assessment = CareerAssessment(
            user_id=user_id,
            assessment_id=assessment_data.get('assessment_id'),
            assessment_type=assessment_data.get('assessment_type', 'career_interests'),
            status='created',
            questions=json.dumps(assessment_data.get('questions', [])),
            created_at=datetime.now()
        )
        assessment.save()
        
        # Track assessment creation
        track_user_event(user_id, "assessment_created", {
            "timestamp": datetime.now().isoformat(),
            "assessment_id": assessment.assessment_id,
            "assessment_type": assessment.assessment_type
        })
        
        return api_response({
            "message": "Assessment created successfully",
            "assessment": assessment_data
        })
    
    except Exception as e:
        current_app.logger.error(f"Error creating assessment: {str(e)}")
        return error_response(f"Error creating assessment: {str(e)}", 500)


@api.route('/assessments/<assessment_id>/submit', methods=['POST'])
@jwt_required()
def submit_assessment(assessment_id):
    """Submit responses for an assessment"""
    user_id = get_jwt_identity()
    
    # Find assessment
    assessment = CareerAssessment.find_by_assessment_id(assessment_id)
    if not assessment or assessment.user_id != user_id:
        return error_response("Assessment not found", 404)
    
    if assessment.status == 'completed':
        return error_response("Assessment already completed", 400)
    
    # Get responses
    data = request.get_json()
    if 'responses' not in data or not isinstance(data['responses'], dict):
        return error_response("Responses required", 400)
    
    responses = data['responses']
    
    # Evaluate assessment
    try:
        results = evaluate_assessment(assessment_id, responses)
        
        # Update assessment in database
        assessment.responses = json.dumps(responses)
        assessment.results = json.dumps(results)
        assessment.status = 'completed'
        assessment.completed_at = datetime.now()
        assessment.save()
        
        # Track assessment completion
        track_user_event(user_id, "assessment_completed", {
            "timestamp": datetime.now().isoformat(),
            "assessment_id": assessment_id,
            "assessment_type": assessment.assessment_type
        })
        
        return api_response({
            "message": "Assessment submitted and evaluated successfully",
            "results": results
        })
    
    except Exception as e:
        current_app.logger.error(f"Error evaluating assessment: {str(e)}")
        return error_response(f"Error evaluating assessment: {str(e)}", 500)


@api.route('/career-readiness', methods=['POST'])
@jwt_required()
def check_career_readiness():
    """Check readiness for a specific career"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return error_response("User not found", 404)
    
    # Get target career
    data = request.get_json()
    if 'target_career' not in data:
        return error_response("Target career required", 400)
    
    target_career = data['target_career']
    
    # Get user profile data
    user_skills = UserSkill.find_by_user_id(user_id)
    skill_list = [skill.name for skill in user_skills]
    
    user_profile = user.to_dict()
    user_profile['skills'] = skill_list
    
    # Get resume experience if available
    resume_profiles = ResumeProfile.find_by_user_id(user_id)
    if resume_profiles:
        latest_resume = resume_profiles[0]  # assuming sorted by latest first
        if latest_resume.parsed_data:
            parsed_data = json.loads(latest_resume.parsed_data)
            if 'experience' in parsed_data:
                user_profile['experience'] = parsed_data['experience']
    
    # Assess readiness
    try:
        readiness = assess_career_readiness(user_profile, target_career)
        
        # Track career readiness check
        track_user_event(user_id, "career_readiness_checked", {
            "timestamp": datetime.now().isoformat(),
            "target_career": target_career,
            "readiness_score": readiness.get("overall_score", 0)
        })
        
        return api_response({
            "message": "Career readiness assessment completed",
            "target_career": target_career,
            "readiness": readiness
        })
    
    except Exception as e:
        current_app.logger.error(f"Error assessing career readiness: {str(e)}")
        return error_response(f"Error assessing career readiness: {str(e)}", 500)


# Career guidance endpoints
@api.route('/career-paths/<path_name>', methods=['GET'])
@jwt_required()
def get_path_details(path_name):
    """Get details for a specific career path"""
    user_id = get_jwt_identity()
    
    try:
        path_details = get_career_path(path_name)
        
        if not path_details:
            return error_response("Career path not found", 404)
        
        # Get user skills if available
        user_skills = UserSkill.find_by_user_id(user_id)
        skill_list = [skill.name for skill in user_skills]
        
        # Create visualization
        visualization = create_path_visualization(path_details, skill_list)
        
        # Track path view
        track_user_event(user_id, "career_path_viewed", {
            "timestamp": datetime.now().isoformat(),
            "path_name": path_name
        })
        
        return api_response({
            "message": "Career path details retrieved",
            "path": path_details,
            "visualization": visualization
        })
    
    except Exception as e:
        current_app.logger.error(f"Error retrieving career path: {str(e)}")
        return error_response(f"Error retrieving career path: {str(e)}", 500)


@api.route('/career-paths/recommended', methods=['GET'])
@jwt_required()
def get_recommended_paths():
    """Get recommended career paths based on user profile"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return error_response("User not found", 404)
    
    # Get assessments if available
    assessments = CareerAssessment.find_by_user_id(user_id)
    
    interest_areas = {}
    if assessments:
        for assessment in assessments:
            if assessment.assessment_type == 'career_interests' and assessment.results:
                results = json.loads(assessment.results)
                if 'interest_areas' in results:
                    interest_areas = results['interest_areas']
                    break
    
    # Get user skills
    user_skills = UserSkill.find_by_user_id(user_id)
    skill_list = [skill.name for skill in user_skills]
    
    # Get recommendations
    try:
        from backend.core.career_guidance import recommend_career_paths
        recommendations = recommend_career_paths(interest_areas, skill_list)
        
        # Track recommendations
        track_user_event(user_id, "career_paths_recommended", {
            "timestamp": datetime.now().isoformat(),
            "recommendation_count": len(recommendations)
        })
        
        return api_response({
            "message": "Recommended career paths retrieved",
            "recommendations": recommendations
        })
    
    except Exception as e:
        current_app.logger.error(f"Error getting career path recommendations: {str(e)}")
        return error_response(f"Error getting recommendations: {str(e)}", 500)


@api.route('/salary-information', methods=['POST'])
@jwt_required()
def get_job_salary():
    """Get salary information for a job role"""
    user_id = get_jwt_identity()
    
    # Get job details
    data = request.get_json()
    required_fields = ['job_title', 'region']
    for field in required_fields:
        if field not in data:
            return error_response(f"Missing required field: {field}", 400)
    
    job_title = data['job_title']
    region = data['region']
    experience = data.get('experience', 'mid')
    
    # Get salary info
    try:
        salary_info = get_salary_information(job_title, region, experience)
        
        # Track salary lookup
        track_user_event(user_id, "salary_information_viewed", {
            "timestamp": datetime.now().isoformat(),
            "job_title": job_title,
            "region": region
        })
        
        return api_response({
            "message": "Salary information retrieved",
            "job_title": job_title,
            "region": region,
            "salary_info": salary_info
        })
    
    except Exception as e:
        current_app.logger.error(f"Error retrieving salary information: {str(e)}")
        return error_response(f"Error retrieving salary information: {str(e)}", 500)


@api.route('/development-plan', methods=['POST'])
@jwt_required()
def create_dev_plan():
    """Create career development plan"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return error_response("User not found", 404)
    
    # Get plan details
    data = request.get_json()
    if 'target_role' not in data:
        return error_response("Target role required", 400)
    
    target_role = data['target_role']
    timeframe = data.get('timeframe', 2)  # default 2 years
    
    # Get user profile
    user_skills = UserSkill.find_by_user_id(user_id)
    skill_list = [skill.name for skill in user_skills]
    
    user_profile = user.to_dict()
    user_profile['skills'] = skill_list
    
    # Get resume experience if available
    resume_profiles = ResumeProfile.find_by_user_id(user_id)
    if resume_profiles:
        latest_resume = resume_profiles[0]  # assuming sorted by latest first
        if latest_resume.parsed_data:
            parsed_data = json.loads(latest_resume.parsed_data)
            if 'experience' in parsed_data:
                user_profile['experience'] = parsed_data['experience']
    
    # Create plan
    try:
        plan = create_career_development_plan(user_profile, target_role, timeframe)
        
        # Track plan creation
        track_user_event(user_id, "development_plan_created", {
            "timestamp": datetime.now().isoformat(),
            "target_role": target_role,
            "timeframe": timeframe
        })
        
        return api_response({
            "message": "Career development plan created",
            "target_role": target_role,
            "timeframe": timeframe,
            "plan": plan
        })
    
    except Exception as e:
        current_app.logger.error(f"Error creating development plan: {str(e)}")
        return error_response(f"Error creating development plan: {str(e)}", 500)


# Interview simulation endpoints
@api.route('/interviews/questions', methods=['POST'])
@jwt_required()
def get_interview_questions():
    """Get interview questions for a job"""
    user_id = get_jwt_identity()
    
    # Get job details
    data = request.get_json()
    required_fields = ['job_title', 'job_description']
    for field in required_fields:
        if field not in data:
            return error_response(f"Missing required field: {field}", 400)
    
    job_title = data['job_title']
    job_description = data['job_description']
    difficulty = data.get('difficulty', 'medium')
    question_count = data.get('question_count', 5)
    
    # Get user skills if available
    user_skills = UserSkill.find_by_user_id(user_id)
    skill_list = [skill.name for skill in user_skills]
    
    # Generate questions
    try:
        from backend.core.interview_simulator import generate_interview_questions
        questions = generate_interview_questions(
            job_title=job_title,
            job_description=job_description,
            user_skills=skill_list,
            difficulty=difficulty,
            question_count=question_count
        )
        
        # Track question generation
        track_user_event(user_id, "interview_questions_generated", {
            "timestamp": datetime.now().isoformat(),
            "job_title": job_title,
            "question_count": len(questions)
        })
        
        return api_response({
            "message": "Interview questions generated",
            "job_title": job_title,
            "questions": questions
        })
    
    except Exception as e:
        current_app.logger.error(f"Error generating interview questions: {str(e)}")
        return error_response(f"Error generating interview questions: {str(e)}", 500)


@api.route('/interviews/evaluate-response', methods=['POST'])
@jwt_required()
def evaluate_response():
    """Evaluate an interview response"""
    user_id = get_jwt_identity()
    
    # Get response details
    data = request.get_json()
    required_fields = ['question', 'response']
    for field in required_fields:
        if field not in data:
            return error_response(f"Missing required field: {field}", 400)
    
    question = data['question']
    response = data['response']
    
    # Evaluate response
    try:
        from backend.core.interview_simulator import evaluate_interview_response
        evaluation = evaluate_interview_response(question, response)
        
        # Track response evaluation
        track_user_event(user_id, "interview_response_evaluated", {
            "timestamp": datetime.now().isoformat(),
            "question_type": question.get('type', 'general'),
            "score": evaluation.get('score', 0)
        })
        
        return api_response({
            "message": "Response evaluated",
            "evaluation": evaluation
        })
    
    except Exception as e:
        current_app.logger.error(f"Error evaluating interview response: {str(e)}")
        return error_response(f"Error evaluating response: {str(e)}", 500)


@api.route('/interviews/mock-session', methods=['POST'])
@jwt_required()
def start_mock_interview():
    """Start a mock interview session"""
    user_id = get_jwt_identity()
    
    # Get session details
    data = request.get_json()
    required_fields = ['job_title', 'job_description']
    for field in required_fields:
        if field not in data:
            return error_response(f"Missing required field: {field}", 400)
    
    job_title = data['job_title']
    job_description = data['job_description']
    difficulty = data.get('difficulty', 'medium')
    question_count = data.get('question_count', 5)
    
    # Start session
    try:
        from backend.core.interview_simulator import start_mock_interview
        session = start_mock_interview(
            user_id=user_id,
            job_title=job_title,
            job_description=job_description,
            difficulty=difficulty,
            question_count=question_count
        )
        
        # Track session start
        track_user_event(user_id, "mock_interview_started", {
            "timestamp": datetime.now().isoformat(),
            "job_title": job_title,
            "session_id": session.get('session_id')
        })
        
        return api_response({
            "message": "Mock interview session started",
            "session": session
        })
    
    except Exception as e:
        current_app.logger.error(f"Error starting mock interview: {str(e)}")
        return error_response(f"Error starting mock interview: {str(e)}", 500)


# Skill recommendation endpoints
@api.route('/skills/recommend', methods=['POST'])
@jwt_required()
def recommend_job_skills():
    """Recommend skills for a job"""
    user_id = get_jwt_identity()
    
    # Get job details
    data = request.get_json()
    if 'job_title' not in data:
        return error_response("Job title required", 400)
    
    job_title = data['job_title']
    count = data.get('count', 10)
    
    # Get user's current skills
    user_skills = UserSkill.find_by_user_id(user_id)
    current_skills = [skill.name for skill in user_skills]
    
    # Get recommendations
    try:
        from backend.core.keyword_recommender import recommend_skills
        recommendations = recommend_skills(job_title, current_skills, count)
        
        # Track recommendations
        track_user_event(user_id, "skill_recommendations_viewed", {
            "timestamp": datetime.now().isoformat(),
            "job_title": job_title,
            "recommendation_count": len(recommendations)
        })
        
        return api_response({
            "message": "Skill recommendations generated",
            "job_title": job_title,
            "current_skills": current_skills,
            "recommended_skills": recommendations
        })
    
    except Exception as e:
        current_app.logger.error(f"Error recommending skills: {str(e)}")
        return error_response(f"Error recommending skills: {str(e)}", 500)


@api.route('/skills/add', methods=['POST'])
@jwt_required()
def add_user_skill():
    """Add a skill to user profile"""
    user_id = get_jwt_identity()
    
    # Get skill details
    data = request.get_json()
    required_fields = ['name', 'proficiency']
    for field in required_fields:
        if field not in data:
            return error_response(f"Missing required field: {field}", 400)
    
    name = data['name']
    proficiency = data['proficiency']
    category = data.get('category', 'Other')
    
    # Check if skill already exists
    existing_skill = UserSkill.find_by_name_and_user(name, user_id)
    if existing_skill:
        return error_response("Skill already exists for this user", 409)
    
    # Add skill
    try:
        skill = UserSkill(
            user_id=user_id,
            name=name,
            proficiency=proficiency,
            category=category,
            created_at=datetime.now()
        )
        skill.save()
        
        # Track skill addition
        track_user_event(user_id, "skill_added", {
            "timestamp": datetime.now().isoformat(),
            "skill_name": name,
            "proficiency": proficiency
        })
        
        return api_response({
            "message": "Skill added successfully",
            "skill": skill.to_dict()
        }, 201)
    
    except Exception as e:
        current_app.logger.error(f"Error adding skill: {str(e)}")
        return error_response(f"Error adding skill: {str(e)}", 500)


@api.route('/skills/extract', methods=['POST'])
@jwt_required()
def extract_skills_from_text():
    """Extract skills from text"""
    user_id = get_jwt_identity()
    
    # Get text
    data = request.get_json()
    if 'text' not in data:
        return error_response("Text required", 400)
    
    text = data['text']
    max_skills = data.get('max_skills', 20)
    
    # Extract skills
    try:
        from backend.core.keyword_recommender import extract_keywords
        skills = extract_keywords(text, max_skills)
        
        # Track skill extraction
        track_user_event(user_id, "skills_extracted", {
            "timestamp": datetime.now().isoformat(),
            "skill_count": len(skills)
        })
        
        return api_response({
            "message": "Skills extracted successfully",
            "skills": skills
        })
    
    except Exception as e:
        current_app.logger.error(f"Error extracting skills: {str(e)}")
        return error_response(f"Error extracting skills: {str(e)}", 500)


# Analytics endpoints
@api.route('/analytics/user-activity', methods=['GET'])
@jwt_required()
def get_user_analytics():
    """Get user activity analytics"""
    user_id = get_jwt_identity()
    
    # Get time period
    days = request.args.get('days', 30, type=int)
    
    # Get activity summary
    try:
        activity = get_user_activity_summary(user_id, days)
        
        return api_response({
            "message": "User activity retrieved",
            "days": days,
            "activity": activity
        })
    
    except Exception as e:
        current_app.logger.error(f"Error retrieving user activity: {str(e)}")
        return error_response(f"Error retrieving user activity: {str(e)}", 500)


@api.route('/analytics/system-usage', methods=['GET'])
@jwt_required()
def get_system_analytics():
    """Get system usage analytics (admin only)"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user or not user.is_admin:
        return error_response("Unauthorized access", 403)
    
    # Get time period
    days = request.args.get('days', 30, type=int)
    
    # Get system stats
    try:
        from backend.core.analytics_engine import get_system_usage_stats
        stats = get_system_usage_stats(days)
        
        return api_response({
            "message": "System usage statistics retrieved",
            "days": days,
            "stats": stats
        })
    
    except Exception as e:
        current_app.logger.error(f"Error retrieving system stats: {str(e)}")
        return error_response(f"Error retrieving system stats: {str(e)}", 500)


# Return the blueprint
def get_api_blueprint():
    """Get the API blueprint"""
    return api 