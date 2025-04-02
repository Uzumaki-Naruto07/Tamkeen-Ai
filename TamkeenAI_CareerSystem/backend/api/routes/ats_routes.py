"""
ATS (Applicant Tracking System) API Routes

This module implements API routes for the advanced CV analysis and ATS matching system.
"""

import os
import io
import json
import tempfile
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from flask import Blueprint, request, jsonify, current_app, send_file
from werkzeug.utils import secure_filename

# Import our ATS analysis services
from ..services.ats.ats_analyzer import create_ats_analyzer
from ..services.ats.resume_extractor import extract_text_from_resume

# Create blueprint
ats_bp = Blueprint('ats', __name__, url_prefix='/api/ats')

# Setup logger
logger = logging.getLogger(__name__)

# Sample jobs data for the frontend
from ..utils.sample_jobs import sample_job_descriptions

@ats_bp.route('/sample-jobs', methods=['GET'])
def get_sample_jobs():
    """Get sample job descriptions for testing"""
    try:
        # Convert sample job data to list of dicts
        jobs = []
        for title, description in sample_job_descriptions.items():
            jobs.append({
                "title": title,
                "description": description
            })
        
        return jsonify({"jobs": jobs})
    except Exception as e:
        logger.error(f"Error getting sample jobs: {str(e)}")
        return jsonify({"error": str(e)}), 500

@ats_bp.route('/analyze', methods=['POST'])
def analyze_resume():
    """
    Analyze a resume for ATS compatibility
    
    Expects:
    - file: Resume file (PDF, DOCX, TXT)
    - job_title: Optional job title
    - job_description: Optional job description for matching
    
    Returns:
        JSON with analysis results
    """
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        
        # Check if filename is empty
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Get job details
        job_title = request.form.get('job_title', '')
        job_description = request.form.get('job_description', '')
        
        # Get API key from environment
        api_key = current_app.config.get('DEEPSEEK_API_KEY', None)
        
        # Create ATS analyzer
        analyzer = create_ats_analyzer(api_key=api_key)
        
        # Save file to temporary location if needed
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp:
            file.save(temp.name)
            temp_path = temp.name
        
        try:
            # Analyze resume
            analysis_results = analyzer.analyze_resume(
                temp_path,
                job_description=job_description,
                job_title=job_title,
                use_semantic_matching=True,
                use_contextual_analysis=True,
                use_deepseek=bool(api_key)
            )
            
            # Clean up temporary file
            os.unlink(temp_path)
            
            # Return results
            return jsonify(analysis_results)
            
        except Exception as e:
            # Clean up temporary file in case of error
            try:
                os.unlink(temp_path)
            except:
                pass
            raise e
    
    except Exception as e:
        logger.error(f"Error analyzing resume: {str(e)}")
        return jsonify({"error": str(e)}), 500

@ats_bp.route('/analyze-with-deepseek', methods=['POST'])
def analyze_resume_with_deepseek():
    """
    Analyze a resume with DeepSeek LLM integration
    
    Expects:
    - file: Resume file (PDF, DOCX, TXT)
    - job_title: Job title
    - job_description: Job description for matching
    
    Returns:
        JSON with analysis results and DeepSeek insights
    """
    try:
        # Check for direct API request headers
        force_real_api = request.headers.get('X-Force-Real-API', 'false').lower() == 'true'
        skip_mock = request.headers.get('X-Skip-Mock', 'false').lower() == 'true'
        
        # Log direct connection attempt
        if force_real_api or skip_mock:
            logger.info("Direct API connection requested - bypassing mock data")
        
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        
        # Check if filename is empty
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Get job details
        job_title = request.form.get('job_title', '')
        job_description = request.form.get('job_description', '')
        force_real_api_form = request.form.get('force_real_api', 'false').lower() == 'true'
        
        # Combine force flags from headers and form data
        force_real_api = force_real_api or force_real_api_form
        
        if not job_description:
            return jsonify({"error": "Job description is required"}), 400
        
        # Get API key from environment
        api_key = current_app.config.get('DEEPSEEK_API_KEY', None)
        
        # Print verbose debug info about API key
        logger.info(f"DeepSeek API connection attempt - API Key present: {'Yes' if api_key else 'No'}")
        if api_key:
            # Show a masked version of the key for debugging (first 4 chars only)
            masked_key = api_key[:4] + "*" * (len(api_key) - 4) if len(api_key) > 4 else "****"
            logger.info(f"Using DeepSeek API Key (masked): {masked_key}")
        else:
            logger.warning("No DeepSeek API key found in environment. Will use mock data.")
        
        # If no API key or not forcing real API, check if we should generate a mock response
        if not api_key:
            if force_real_api or skip_mock:
                # If explicitly requesting real API but no key available, return error
                logger.error("Real API requested but no DeepSeek API key found")
                return jsonify({
                    "error": "DeepSeek API key is not configured. Please set the DEEPSEEK_API_KEY environment variable."
                }), 500
                
            # If not forcing real API, fallback to mock data
            logger.info("Using mock data because no API key is available")
            
            # Extract text from resume
            temp_path = None
            try:
                with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp:
                    file.save(temp.name)
                    temp_path = temp.name
                
                # Extract text
                resume_text = extract_text_from_resume(temp_path)
                
                # Clean up temporary file
                os.unlink(temp_path)
                
                # Generate mock analysis with available tools
                from ..services.ats.keyword_extractor import find_matching_keywords, calculate_similarity_score
                
                # Find matching keywords
                keyword_matches = find_matching_keywords(resume_text, job_description)
                matching_keywords = keyword_matches.get("matching_keywords", [])
                missing_keywords = keyword_matches.get("missing_keywords", [])
                
                # Calculate similarity score
                score = calculate_similarity_score(resume_text, job_description)
                
                # Create mock analysis
                mock_analysis = {
                    "score": round(score),
                    "job_title": job_title,
                    "matching_keywords": matching_keywords,
                    "missing_keywords": missing_keywords,
                    "assessment": _get_assessment_message(score),
                    "llm_analysis": "DeepSeek analysis unavailable - API key not configured.",
                    "improvement_roadmap": "Improvement roadmap unavailable - API key not configured.",
                    "using_mock_data": True
                }
                
                return jsonify(mock_analysis)
                
            except Exception as e:
                # Clean up temporary file in case of error
                if temp_path:
                    try:
                        os.unlink(temp_path)
                    except:
                        pass
                raise e
        
        # Log that we're using the real DeepSeek API
        logger.info("Using real DeepSeek API for analysis")
        
        # Create ATS analyzer with API key
        analyzer = create_ats_analyzer(api_key=api_key)
        
        # Save file to temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp:
            file.save(temp.name)
            temp_path = temp.name
        
        try:
            # Analyze resume with DeepSeek
            analysis_results = analyzer.analyze_resume(
                temp_path,
                job_description=job_description,
                job_title=job_title,
                use_semantic_matching=True,
                use_contextual_analysis=True,
                use_deepseek=True
            )
            
            # Clean up temporary file
            os.unlink(temp_path)
            
            # Return results
            return jsonify(analysis_results)
            
        except Exception as e:
            # Clean up temporary file in case of error
            try:
                os.unlink(temp_path)
            except:
                pass
            raise e
    
    except Exception as e:
        logger.error(f"Error analyzing resume with DeepSeek: {str(e)}")
        return jsonify({"error": str(e)}), 500

@ats_bp.route('/analyze-with-visuals', methods=['POST'])
def analyze_resume_with_visuals():
    """
    Analyze a resume and generate visualizations
    
    Expects:
    - file: Resume file (PDF, DOCX, TXT)
    - job_title: Job title
    - job_description: Job description for matching
    
    Returns:
        JSON with analysis results and visualization data
    """
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        
        # Check if filename is empty
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Get job details
        job_title = request.form.get('job_title', '')
        job_description = request.form.get('job_description', '')
        
        if not job_description:
            return jsonify({"error": "Job description is required"}), 400
        
        # Create ATS analyzer
        analyzer = create_ats_analyzer()
        
        # Save file to temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp:
            file.save(temp.name)
            temp_path = temp.name
        
        try:
            # Analyze resume
            analysis_results = analyzer.analyze_resume(
                temp_path,
                job_description=job_description,
                job_title=job_title,
                use_semantic_matching=True,
                use_contextual_analysis=True,
                use_deepseek=False
            )
            
            # Clean up temporary file
            os.unlink(temp_path)
            
            # Return results
            return jsonify(analysis_results)
            
        except Exception as e:
            # Clean up temporary file in case of error
            try:
                os.unlink(temp_path)
            except:
                pass
            raise e
    
    except Exception as e:
        logger.error(f"Error analyzing resume with visuals: {str(e)}")
        return jsonify({"error": str(e)}), 500

@ats_bp.route('/keywords', methods=['POST'])
def get_keywords():
    """
    Extract keywords from resume and job description
    
    Expects:
    - resume_text: Resume text content
    - job_description: Job description text
    
    Returns:
        JSON with extracted keywords
    """
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        resume_text = data.get('resume_text', '')
        job_description = data.get('job_description', '')
        
        if not resume_text:
            return jsonify({"error": "Resume text is required"}), 400
        
        # Extract and match keywords
        from ..services.ats.keyword_extractor import find_matching_keywords
        
        keyword_matches = find_matching_keywords(resume_text, job_description)
        
        return jsonify(keyword_matches)
        
    except Exception as e:
        logger.error(f"Error extracting keywords: {str(e)}")
        return jsonify({"error": str(e)}), 500

@ats_bp.route('/optimize', methods=['POST'])
def optimize_resume():
    """
    Get optimization suggestions for resume
    
    Expects:
    - resume_text: Resume text content
    - job_title: Job title
    - job_description: Job description
    
    Returns:
        JSON with optimization suggestions
    """
    try:
        data = request.form
        
        resume_text = data.get('resume_text', '')
        job_title = data.get('job_title', '')
        job_description = data.get('job_description', '')
        
        if not resume_text:
            return jsonify({"error": "Resume text is required"}), 400
        
        if not job_description:
            return jsonify({"error": "Job description is required"}), 400
        
        # Get API key for DeepSeek
        api_key = current_app.config.get('DEEPSEEK_API_KEY', None)
        
        # Create ATS analyzer
        analyzer = create_ats_analyzer(api_key=api_key)
        
        # Save resume text to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.txt', mode='w') as temp:
            temp.write(resume_text)
            temp_path = temp.name
        
        try:
            # Analyze resume
            analysis_results = analyzer.analyze_resume(
                temp_path,
                job_description=job_description,
                job_title=job_title,
                use_semantic_matching=True,
                use_contextual_analysis=True,
                use_deepseek=bool(api_key)
            )
            
            # Clean up temporary file
            os.unlink(temp_path)
            
            # Extract optimization suggestions
            optimization = {
                "recommendations": analysis_results.get("recommendations", []),
                "sections_analysis": analysis_results.get("sections_analysis", {}),
                "matching_keywords": analysis_results.get("matching_keywords", []),
                "missing_keywords": analysis_results.get("missing_keywords", []),
                "ats_score": analysis_results.get("score", 0)
            }
            
            if "llm_analysis" in analysis_results:
                optimization["llm_analysis"] = analysis_results["llm_analysis"]
            
            return jsonify(optimization)
            
        except Exception as e:
            # Clean up temporary file in case of error
            try:
                os.unlink(temp_path)
            except:
                pass
            raise e
    
    except Exception as e:
        logger.error(f"Error optimizing resume: {str(e)}")
        return jsonify({"error": str(e)}), 500

def _get_assessment_message(score: float) -> str:
    """Get assessment message based on score"""
    if score >= 80:
        return "Excellent! Your resume is highly compatible with this job."
    elif score >= 60:
        return "Good. Your resume matches the job requirements reasonably well."
    elif score >= 40:
        return "Average. Consider optimizing your resume for better matching."
    else:
        return "Below average. Your resume needs significant improvements to match this job."

# Add a new endpoint to test DeepSeek API connectivity
@ats_bp.route('/test-deepseek-connection', methods=['GET'])
def test_deepseek_connection():
    """
    Test the connection to DeepSeek API
    
    Returns:
        JSON with connection status
    """
    try:
        # Get API key from environment
        api_key = current_app.config.get('DEEPSEEK_API_KEY', None)
        
        if not api_key:
            logger.warning("No DeepSeek API key found in environment.")
            return jsonify({
                "connected": False,
                "error": "No API key configured",
                "message": "DeepSeek API key is not set in the environment"
            })
        
        # Initialize OpenAI client with DeepSeek settings
        try:
            from openai import OpenAI
            client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=api_key
            )
            
            # Test with a simple prompt
            response = client.chat.completions.create(
                model="deepseek/deepseek-r1:free",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": "Say 'DeepSeek API connection successful!'"}
                ],
                max_tokens=20
            )
            
            if response and response.choices and len(response.choices) > 0:
                logger.info("DeepSeek API connection successful!")
                return jsonify({
                    "connected": True,
                    "message": "DeepSeek API connection successful",
                    "response": response.choices[0].message.content
                })
            else:
                logger.error("DeepSeek API returned empty response")
                return jsonify({
                    "connected": False,
                    "error": "Empty response",
                    "message": "DeepSeek API returned empty response"
                })
                
        except ImportError as e:
            logger.error(f"OpenAI library not installed: {str(e)}")
            return jsonify({
                "connected": False,
                "error": "Missing dependency",
                "message": "OpenAI library not installed. Install with: pip install openai"
            })
        except Exception as e:
            logger.error(f"DeepSeek API connection error: {str(e)}")
            return jsonify({
                "connected": False,
                "error": str(e),
                "message": "Failed to connect to DeepSeek API. Check your API key and network."
            })
    
    except Exception as e:
        logger.error(f"Error testing DeepSeek connection: {str(e)}")
        return jsonify({"error": str(e)}), 500 