"""
Resume Routes Module

This module provides API routes for resume upload, parsing, management, and analysis.
"""

import os
import logging
import uuid
from flask import Blueprint, request, jsonify, g, current_app
from werkzeug.utils import secure_filename
from datetime import datetime
import json

# Import utilities
from api.utils.date_utils import now
from api.utils.cache_utils import cache_result

# Import database models
from api.database.models import Resume, User

# Import core modules
from api.core.profile_extractor import ProfileExtractor

# Import auth decorators - Fix the import path
try:
    from api.middleware.auth import jwt_required as require_auth
    from api.middleware.auth import role_required as require_role
except ImportError:
    # Fallback to compatibility functions
    try:
        from api.app import require_auth, require_role
    except ImportError:
        # Create dummy decorators if imports fail
        def require_auth(f):
            return f
        def require_role(roles):
            def decorator(f):
                return f
            return decorator
        print("Warning: Auth decorators not found. Using dummy decorators.")

# Import settings
from api.config.settings import UPLOAD_FOLDER, ALLOWED_EXTENSIONS

# Import services
from api.services.resume_service import analyze_resume, improve_resume, extract_skills_from_resume

# Import middleware
from api.middleware.auth_middleware import token_required

# Optional: Import ML libraries if available
try:
    import numpy as np
    from keybert import KeyBERT
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint
resume_bp = Blueprint('resume', __name__)

# Create profile extractor
profile_extractor = ProfileExtractor()

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'txt'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def extract_keywords(text, top_n=15):
    """Extract keywords from text using KeyBERT if available, otherwise mock data"""
    if ML_AVAILABLE:
        try:
            keybert_model = KeyBERT()
            keywords = keybert_model.extract_keywords(text, keyphrase_ngram_range=(1, 2), stop_words='english', top_n=top_n)
            return [keyword[0] for keyword in keywords]
        except Exception as e:
            logger.error(f"Error extracting keywords with KeyBERT: {e}")
            return generate_mock_keywords(top_n)
    else:
        return generate_mock_keywords(top_n)


def generate_mock_keywords(top_n=15):
    """Generate mock keywords for demonstration purposes"""
    tech_skills = ["Python", "JavaScript", "React", "SQL", "AWS", "Docker", "Git", "Node.js", 
                  "TypeScript", "DevOps", "CI/CD", "Machine Learning", "Data Science", 
                  "REST API", "Agile", "Scrum", "CSS", "HTML", "Flask", "Django"]
    soft_skills = ["Communication", "Leadership", "Problem Solving", "Teamwork", "Time Management",
                  "Adaptability", "Creativity", "Critical Thinking", "Attention to Detail"]
    
    # Randomly select keywords
    import random
    tech_count = min(int(top_n * 0.7), len(tech_skills))
    soft_count = min(top_n - tech_count, len(soft_skills))
    
    keywords = random.sample(tech_skills, tech_count) + random.sample(soft_skills, soft_count)
    random.shuffle(keywords)
    
    return keywords[:top_n]


def evaluate_resume_match(resume_text, job_description):
    """Evaluate how well a resume matches a job description"""
    if not ML_AVAILABLE:
        # If ML libraries aren't available, return mock data
        import random
        score = random.randint(65, 95)
        
        resume_keywords = generate_mock_keywords(12)
        job_keywords = generate_mock_keywords(15)
        
        # Ensure some overlap for realistic matching
        overlap_count = int(min(len(resume_keywords), len(job_keywords)) * 0.4)
        for i in range(overlap_count):
            job_keywords[i] = resume_keywords[i]
            
        matched_keywords = [kw for kw in resume_keywords if kw in job_keywords]
        missing_keywords = [kw for kw in job_keywords if kw not in resume_keywords]
        
        return {
            "score": score,
            "resume_keywords": resume_keywords,
            "job_keywords": job_keywords,
            "matched_keywords": matched_keywords,
            "missing_keywords": missing_keywords,
            "strengths": [
                "Strong technical background aligned with job requirements",
                "Relevant project experience",
                "Good soft skills representation"
            ],
            "weaknesses": [
                "Missing some key technical keywords",
                "Experience section could be more quantifiable",
                "Consider adding more industry-specific terminology"
            ],
            "suggestions": [
                "Add specific metrics to demonstrate impact",
                "Include missing keywords where applicable",
                "Tailor summary section to match job description"
            ]
        }
    else:
        # Implement actual ML-based evaluation here when ML libraries are available
        # This is a simplified example
        try:
            resume_keywords = extract_keywords(resume_text, 12)
            job_keywords = extract_keywords(job_description, 15)
            
            # Calculate match score based on keyword overlap
            matched_keywords = [kw for kw in resume_keywords if kw.lower() in [j.lower() for j in job_keywords]]
            match_percentage = len(matched_keywords) / len(job_keywords) if job_keywords else 0
            score = int(match_percentage * 100)
            
            # Identify missing keywords
            missing_keywords = [kw for kw in job_keywords if kw.lower() not in [r.lower() for r in resume_keywords]]
            
            # Generate strengths and weaknesses based on score
            strengths = []
            weaknesses = []
            suggestions = []
            
            if score > 80:
                strengths.append("Strong overall match with job requirements")
            elif score < 60:
                weaknesses.append("Low overall match with job requirements")
            
            if len(matched_keywords) > 5:
                strengths.append("Good keyword alignment with job description")
            
            if len(missing_keywords) > 3:
                weaknesses.append(f"Missing several key skills: {', '.join(missing_keywords[:3])}")
                suggestions.append(f"Add missing keywords where applicable: {', '.join(missing_keywords)}")
            
            return {
                "score": score,
                "resume_keywords": resume_keywords,
                "job_keywords": job_keywords,
                "matched_keywords": matched_keywords,
                "missing_keywords": missing_keywords,
                "strengths": strengths,
                "weaknesses": weaknesses,
                "suggestions": suggestions
            }
        except Exception as e:
            logger.error(f"Error in ML evaluation: {e}")
            # Fall back to mock data
            return evaluate_resume_match(None, None)


@resume_bp.route('/upload', methods=['POST'])
def upload_resume():
    """Upload and store a resume file"""
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Add unique identifier to prevent overwriting
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(file_path)
        
        # Extract text from resume file (simplified)
        resume_text = "Sample resume text for demonstration"
        
        return jsonify({
            "success": True,
            "message": "Resume uploaded successfully",
            "file_id": unique_filename,
            "filename": filename,
            "upload_time": datetime.now().isoformat()
        }), 201
    
    return jsonify({"error": "File type not allowed"}), 400


@resume_bp.route('/score', methods=['POST'])
def score_resume():
    """Score a resume against a job description"""
    data = request.json
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    resume_text = data.get('resume_text', '')
    job_description = data.get('job_description', '')
    
    if not resume_text or not job_description:
        return jsonify({"error": "Both resume text and job description are required"}), 400
    
    # Evaluate the match
    evaluation_result = evaluate_resume_match(resume_text, job_description)
    
    # Format and return the response
    response = {
        "success": True,
        "timestamp": datetime.now().isoformat(),
        "evaluation": evaluation_result
    }
    
    return jsonify(response), 200


@resume_bp.route('/analyze/<resume_id>', methods=['GET'])
def analyze_resume(resume_id):
    """Analyze a previously uploaded resume"""
    # In a real implementation, you would retrieve the resume from a database
    # and perform an analysis on it
    
    # Mock response
    analysis = {
        "sections": {
            "header": {"score": 90, "feedback": "Good contact information"},
            "summary": {"score": 85, "feedback": "Clear and concise summary"},
            "experience": {"score": 78, "feedback": "Add more quantifiable achievements"},
            "education": {"score": 92, "feedback": "Well-structured education section"},
            "skills": {"score": 88, "feedback": "Good range of technical skills"}
        },
        "overall_score": 87,
        "keyword_density": {
            "Python": 5,
            "JavaScript": 4,
            "React": 3,
            "Leadership": 2,
            "Project Management": 2
        },
        "suggestions": [
            "Add more metrics and achievements in your experience section",
            "Consider adding certifications if you have any",
            "Ensure skills are aligned with target job descriptions"
        ]
    }
    
    return jsonify({
        "success": True,
        "resume_id": resume_id,
        "analysis": analysis,
        "timestamp": datetime.now().isoformat()
    }), 200


@resume_bp.route('/history/<user_id>', methods=['GET'])
def resume_history(user_id):
    """Get user's resume analysis history"""
    # In a real implementation, you would retrieve this from a database
    
    # Mock response
    history = [
        {
            "id": "abc123",
            "date": (datetime.now().replace(day=datetime.now().day-7)).isoformat(),
            "score": 78,
            "job_title": "Frontend Developer",
            "company": "TechCorp"
        },
        {
            "id": "def456",
            "date": (datetime.now().replace(day=datetime.now().day-4)).isoformat(),
            "score": 82,
            "job_title": "Full Stack Developer",
            "company": "WebSolutions"
        },
        {
            "id": "ghi789",
            "date": datetime.now().isoformat(),
            "score": 87,
            "job_title": "React Developer",
            "company": "AppMakers"
        }
    ]
    
    return jsonify({
        "success": True,
        "user_id": user_id,
        "history": history
    }), 200


@resume_bp.route('/templates', methods=['GET'])
def get_templates():
    """Get available resume templates"""
    templates = [
        {
            "id": "modern",
            "name": "Modern",
            "description": "Clean, modern layout with emphasis on skills",
            "preview_url": "/static/templates/modern_preview.jpg"
        },
        {
            "id": "professional",
            "name": "Professional",
            "description": "Traditional layout for corporate environments",
            "preview_url": "/static/templates/professional_preview.jpg"
        },
        {
            "id": "creative",
            "name": "Creative",
            "description": "Unique design for creative industries",
            "preview_url": "/static/templates/creative_preview.jpg"
        }
    ]
    
    return jsonify({
        "success": True,
        "templates": templates
    }), 200


@resume_bp.route('', methods=['POST'])
@require_auth
def upload_resume_route():
    """Upload a new resume"""
    try:
        # Get user information from auth middleware
        user_id = g.user.id
        
        # Get request data
        data = request.json
        if not data:
            return jsonify({
                "status": "error",
                "timestamp": now(),
                "message": "No data provided"
            }), 400
        
        # Extract resume data
        title = data.get('title', 'My Resume')
        content = data.get('content', {})
        skills = data.get('skills', [])
        education = data.get('education', [])
        experience = data.get('experience', [])
        
        # Create resume object
        resume = Resume(
            user_id=user_id,
            title=title,
            content=content,
            skills=skills,
            education=education,
            experience=experience
        )
        
        # Save resume
        if resume.save():
            return jsonify({
                "status": "success",
                "timestamp": now(),
                "message": "Resume uploaded successfully",
                "data": {
                    "resume": resume.to_dict()
                }
            }), 201
        else:
            return jsonify({
                "status": "error",
                "timestamp": now(),
                "message": "Failed to save resume"
            }), 500
        
    except Exception as e:
        logger.error(f"Error in upload_resume: {str(e)}")
        return jsonify({
            "status": "error",
            "timestamp": now(),
            "message": f"Failed to upload resume: {str(e)}"
        }), 500


@resume_bp.route('', methods=['GET'])
@require_auth
def get_resumes():
    """Get all resumes for the authenticated user"""
    try:
        # Get user information from auth middleware
        user_id = g.user.id
        
        # Find resumes for the user
        resumes = Resume.find_by_user(user_id)
        
        # Convert to dict representation
        result = [resume.to_dict() for resume in resumes]
        
        return jsonify({
            "status": "success",
            "timestamp": now(),
            "data": {
                "resumes": result
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_resumes: {str(e)}")
        return jsonify({
            "status": "error",
            "timestamp": now(),
            "message": f"Failed to retrieve resumes: {str(e)}"
        }), 500


@resume_bp.route('/<resume_id>', methods=['GET'])
@require_auth
def get_resume(resume_id):
    """Get a specific resume by ID"""
    try:
        # Get user information from auth middleware
        user_id = g.user.id
        
        # Find resume by ID
        resume = Resume.find_by_id(resume_id)
        
        # Check if resume exists and belongs to the user
        if not resume or resume.user_id != user_id:
            return jsonify({
                "status": "error",
                "timestamp": now(),
                "message": "Resume not found or access denied"
            }), 404
        
        return jsonify({
            "status": "success",
            "timestamp": now(),
            "data": {
                "resume": resume.to_dict()
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_resume: {str(e)}")
        return jsonify({
            "status": "error",
            "timestamp": now(),
            "message": f"Failed to retrieve resume: {str(e)}"
        }), 500


@resume_bp.route('/<resume_id>', methods=['PUT'])
@require_auth
def update_resume(resume_id):
    """Update an existing resume"""
    try:
        # Get user information from auth middleware
        user_id = g.user.id
        
        # Find resume by ID
        resume = Resume.find_by_id(resume_id)
        
        # Check if resume exists and belongs to the user
        if not resume or resume.user_id != user_id:
            return jsonify({
                "status": "error",
                "timestamp": now(),
                "message": "Resume not found or access denied"
            }), 404
        
        # Get request data
        data = request.json
        if not data:
            return jsonify({
                "status": "error",
                "timestamp": now(),
                "message": "No data provided"
            }), 400
        
        # Update resume fields
        if 'title' in data:
            resume.title = data['title']
        if 'content' in data:
            resume.content = data['content']
        if 'skills' in data:
            resume.skills = data['skills']
        if 'education' in data:
            resume.education = data['education']
        if 'experience' in data:
            resume.experience = data['experience']
        
        # Update timestamp
        resume.updated_at = datetime.now().isoformat()
        
        # Save resume
        if resume.save():
            return jsonify({
                "status": "success",
                "timestamp": now(),
                "message": "Resume updated successfully",
                "data": {
                    "resume": resume.to_dict()
                }
            }), 200
        else:
            return jsonify({
                "status": "error",
                "timestamp": now(),
                "message": "Failed to update resume"
            }), 500
        
    except Exception as e:
        logger.error(f"Error in update_resume: {str(e)}")
        return jsonify({
            "status": "error",
            "timestamp": now(),
            "message": f"Failed to update resume: {str(e)}"
        }), 500


@resume_bp.route('/<resume_id>', methods=['DELETE'])
@require_auth
def delete_resume(resume_id):
    """Delete a resume"""
    try:
        # Get user information from auth middleware
        user_id = g.user.id
        
        # Find resume by ID
        resume = Resume.find_by_id(resume_id)
        
        # Check if resume exists and belongs to the user
        if not resume or resume.user_id != user_id:
            return jsonify({
                "status": "error",
                "timestamp": now(),
                "message": "Resume not found or access denied"
            }), 404
        
        # Delete resume
        if resume.delete():
            return jsonify({
                "status": "success",
                "timestamp": now(),
                "message": "Resume deleted successfully"
            }), 200
        else:
            return jsonify({
                "status": "error",
                "timestamp": now(),
                "message": "Failed to delete resume"
            }), 500
        
    except Exception as e:
        logger.error(f"Error in delete_resume: {str(e)}")
        return jsonify({
            "status": "error",
            "timestamp": now(),
            "message": f"Failed to delete resume: {str(e)}"
        }), 500


@resume_bp.route('/<resume_id>/parse', methods=['POST'])
@require_auth
def parse_resume(resume_id):
    """Re-parse a resume"""
    try:
        # Get resume
        resumes = Resume.find_by_id(resume_id)
        if not resumes:
            return jsonify({
                'success': False,
                'error': 'Resume not found'
            }), 404
        
        resume = resumes[0]
        
        # Check if user has permission
        if resume.user_id != g.user and g.user_role != 'admin':
            return jsonify({
                'success': False,
                'error': 'Permission denied'
            }), 403
        
        # Parse resume content
        parsed_data = profile_extractor.extract_profile_from_text(resume.content)
        
        # Update resume
        resume.parsed_data = parsed_data
        resume.status = 'processed'
        resume.updated_at = now().isoformat()
        
        if not resume.save():
            return jsonify({
                'success': False,
                'error': 'Error updating resume'
            }), 500
        
        return jsonify({
            'success': True,
            'data': resume.to_dict(),
            'message': 'Resume parsed successfully'
        })
        
    except Exception as e:
        logger.error(f"Error parsing resume {resume_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@resume_bp.route('/<resume_id>/download', methods=['GET'])
@require_auth
def download_resume(resume_id):
    """Download resume file"""
    try:
        # Get resume
        resumes = Resume.find_by_id(resume_id)
        if not resumes:
            return jsonify({
                'success': False,
                'error': 'Resume not found'
            }), 404
        
        resume = resumes[0]
        
        # Check if user has permission
        if resume.user_id != g.user and g.user_role not in ['admin', 'recruiter']:
            return jsonify({
                'success': False,
                'error': 'Permission denied'
            }), 403
        
        # Check if file exists
        if not resume.file_path:
            return jsonify({
                'success': False,
                'error': 'File not found'
            }), 404
        
        file_path = os.path.join(UPLOAD_FOLDER, resume.file_path)
        if not os.path.exists(file_path):
            return jsonify({
                'success': False,
                'error': 'File not found'
            }), 404
        
        # Return file path for serving
        # In a real app, we would use send_file or redirect to a file server
        return jsonify({
            'success': True,
            'data': {
                'file_path': file_path,
                'filename': resume.filename
            }
        })
        
    except Exception as e:
        logger.error(f"Error downloading resume {resume_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@resume_bp.route('/<resume_id>/skills', methods=['GET'])
@require_auth
def get_resume_skills(resume_id):
    """Get skills from resume"""
    try:
        # Get resume
        resumes = Resume.find_by_id(resume_id)
        if not resumes:
            return jsonify({
                'success': False,
                'error': 'Resume not found'
            }), 404
        
        resume = resumes[0]
        
        # Check if user has permission
        if resume.user_id != g.user and g.user_role not in ['admin', 'recruiter']:
            return jsonify({
                'success': False,
                'error': 'Permission denied'
            }), 403
        
        # Get skills from parsed data
        skills = []
        parsed_data = resume.parsed_data
        
        if parsed_data and isinstance(parsed_data, dict):
            skills = parsed_data.get('skills', [])
        
        return jsonify({
            'success': True,
            'data': {
                'skills': skills
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting skills for resume {resume_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@resume_bp.route('/resume/analyze', methods=['POST'])
@token_required
def analyze_resume_endpoint(current_user):
    """Analyze a resume and provide feedback"""
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
            
        file = request.files['file']
        
        # Check if filename is empty
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
            
        # Check if file is allowed
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join('/tmp', filename)
            file.save(filepath)
            
            # Get job title if provided
            job_title = request.form.get('job_title', '')
            
            # Analyze resume
            result = analyze_resume(filepath, job_title)
            
            # Clean up
            os.remove(filepath)
            
            return jsonify(result), 200
        else:
            return jsonify({"error": "File type not allowed"}), 400
            
    except Exception as e:
        logger.error(f"Error analyzing resume: {str(e)}")
        return jsonify({"error": str(e)}), 500


@resume_bp.route('/resume/improve', methods=['POST'])
@token_required
def improve_resume_endpoint(current_user):
    """Generate suggestions to improve a resume"""
    try:
        data = request.json
        
        # Validate input
        if not data or 'resume_text' not in data:
            return jsonify({"error": "Resume text is required"}), 400
            
        # Get job title if provided
        job_title = data.get('job_title', '')
        
        # Generate improvements
        result = improve_resume(data['resume_text'], job_title)
        
        return jsonify(result), 200
            
    except Exception as e:
        logger.error(f"Error improving resume: {str(e)}")
        return jsonify({"error": str(e)}), 500


@resume_bp.route('/resume/extract-skills', methods=['POST'])
@token_required
def extract_skills_endpoint(current_user):
    """Extract skills from a resume"""
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
            
        file = request.files['file']
        
        # Check if filename is empty
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
            
        # Check if file is allowed
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join('/tmp', filename)
            file.save(filepath)
            
            # Extract skills
            skills = extract_skills_from_resume(filepath)
            
            # Clean up
            os.remove(filepath)
            
            return jsonify({"skills": skills}), 200
        else:
            return jsonify({"error": "File type not allowed"}), 400
            
    except Exception as e:
        logger.error(f"Error extracting skills: {str(e)}")
        return jsonify({"error": str(e)}), 500


@resume_bp.route('/analyze-with-openai', methods=['POST'])
def analyze_with_openai():
    """Analyze a resume with OpenAI as fallback to DeepSeek"""
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    job_title = request.form.get('job_title', 'Unknown Position')
    job_description = request.form.get('job_description', '')
    
    if not job_description:
        return jsonify({"error": "Job description is required"}), 400
    
    # Save the file temporarily
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(file_path)
        
        try:
            # Extract text from the resume file
            resume_text = extract_text_from_file(file_path)
            
            # Import OpenAI here to avoid global dependency
            try:
                from openai import OpenAI
                client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
                
                # Create a system message for resume analysis
                system_message = """You are an expert ATS resume analyzer. Analyze the resume against the job description and provide:
                1. A score from 0-100
                2. Matching keywords found in both resume and job description
                3. Important keywords from job description missing in resume
                4. A detailed analysis with strengths, weaknesses, and recommendations
                5. A career improvement roadmap
                Format your response as JSON with these keys: score, matching_keywords, missing_keywords, assessment, llm_analysis, improvement_roadmap"""
                
                # Send to OpenAI for analysis
                response = client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": f"Job Title: {job_title}\n\nJob Description: {job_description}\n\nResume: {resume_text}"}
                    ],
                    temperature=0.5,
                    response_format={ "type": "json_object" }
                )
                
                # Parse the response
                result = json.loads(response.choices[0].message.content)
                
                # Include the complete evaluation data
                evaluation_result = evaluate_resume_match(resume_text, job_description)
                result.update({
                    "job_title": job_title,
                    "resume_keywords": evaluation_result.get("resume_keywords", []),
                    "job_keywords": evaluation_result.get("job_keywords", []),
                    "strengths": evaluation_result.get("strengths", []),
                    "weaknesses": evaluation_result.get("weaknesses", []),
                    "suggestions": evaluation_result.get("suggestions", [])
                })
                
                return jsonify(result), 200
                
            except ImportError:
                logger.error("OpenAI library not available")
                return jsonify({"error": "OpenAI analysis not available"}), 500
            except Exception as e:
                logger.error(f"OpenAI analysis error: {str(e)}")
                return jsonify({"error": f"OpenAI analysis failed: {str(e)}"}), 500
                
        except Exception as e:
            logger.error(f"File processing error: {str(e)}")
            return jsonify({"error": str(e)}), 500
        finally:
            # Clean up the temporary file
            if os.path.exists(file_path):
                os.remove(file_path)
    
    return jsonify({"error": "File type not allowed"}), 400


def extract_text_from_file(file_path):
    """Extract text from uploaded resume file"""
    file_ext = file_path.split('.')[-1].lower()
    
    try:
        if file_ext == 'pdf':
            try:
                import PyPDF2
                with open(file_path, 'rb') as file:
                    reader = PyPDF2.PdfReader(file)
                    text = ""
                    for page in reader.pages:
                        text += page.extract_text() + "\n"
                    return text
            except ImportError:
                logger.warning("PyPDF2 not available, falling back to simple text extraction")
                return "PDF text extraction not available"
                
        elif file_ext in ['docx', 'doc']:
            try:
                import docx2txt
                return docx2txt.process(file_path)
            except ImportError:
                logger.warning("docx2txt not available, falling back to simple text extraction")
                return "DOCX text extraction not available"
                
        elif file_ext == 'txt':
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
                
        else:
            return "Unsupported file format"
            
    except Exception as e:
        logger.error(f"Text extraction error: {str(e)}")
        return f"Error extracting text: {str(e)}"


@resume_bp.route('/test-upload', methods=['POST'])
def test_upload():
    """Simple test upload endpoint"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
            
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        # Just return success without actually saving the file
        return jsonify({
            "success": True,
            "message": "File received successfully",
            "filename": file.filename,
            "upload_time": datetime.now().isoformat()
        }), 201
    except Exception as e:
        logger.error(f"Error in test upload: {str(e)}")
        return jsonify({"error": str(e)}), 500 