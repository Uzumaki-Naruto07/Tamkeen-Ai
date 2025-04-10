"""
PredictAPI Server - Standalone server for AI predictions

This is a standalone server for AI predictions using the PredictAPI.
It provides endpoints for analyzing resumes, matching jobs, and generating career advice.
"""

import os
import tempfile
import logging
from typing import Dict, Any, List, Optional
from flask import Flask, request, jsonify
from flask_cors import CORS
import argparse

# Import PredictAPI modules
from api.services.predict_api import DeepSeekClient
from api.services.ats.resume_extractor import extract_text_from_resume

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Create DeepSeekClient
def get_deepseek_client():
    """Get or create DeepSeekClient instance"""
    api_key = os.environ.get('DEEPSEEK_API_KEY')
    
    # Force mock data mode if environment variable is set
    use_mock = os.environ.get('USE_MOCK_DATA', 'true').lower() in ('true', '1', 't', 'yes')
    
    client = DeepSeekClient(
        api_key=api_key,
        mock_data_enabled=use_mock
    )
    
    logger.info(f"DeepSeek client initialized. Using mock data: {client.is_using_mock()}")
    return client

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "service": "PredictAPI Server",
        "version": "1.0.0",
        "using_mock": get_deepseek_client().is_using_mock()
    })

# Resume analysis endpoint
@app.route('/analyze-resume', methods=['POST'])
def analyze_resume():
    """
    Analyze a resume against a job description
    
    Expects:
    - file: Resume file (PDF, DOCX, TXT)
    - job_title: Job title
    - job_description: Job description for matching
    
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
        
        if not job_description:
            return jsonify({"error": "Job description is required"}), 400
        
        # Initialize DeepSeekClient
        deepseek_client = get_deepseek_client()
        
        # Save file to temporary location
        temp_path = None
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp:
                file.save(temp.name)
                temp_path = temp.name
            
            # Extract text from resume
            resume_text = extract_text_from_resume(temp_path)
            
            # Analyze resume with DeepSeek
            analysis_results = deepseek_client.analyze_resume(
                resume_text=resume_text,
                job_description=job_description,
                job_title=job_title,
                detailed=True
            )
            
            # Clean up temporary file
            if temp_path and os.path.exists(temp_path):
                os.unlink(temp_path)
            
            # Add filename to results
            analysis_results['filename'] = file.filename
            analysis_results['job_title'] = job_title
            
            # Return results
            return jsonify(analysis_results)
            
        except Exception as e:
            # Clean up temporary file in case of error
            if temp_path and os.path.exists(temp_path):
                try:
                    os.unlink(temp_path)
                except:
                    pass
            
            logger.error(f"Resume analysis failed: {str(e)}")
            
            return jsonify({
                "error": f"Resume analysis failed: {str(e)}",
                "status": "analysis_failed"
            }), 500
    
    except Exception as e:
        logger.error(f"Error in resume analysis route: {str(e)}")
        return jsonify({
            "error": f"Error in resume analysis: {str(e)}",
            "status": "route_exception"
        }), 500

# Career advice endpoint
@app.route('/career-advice', methods=['POST'])
def career_advice():
    """
    Generate career advice
    
    Expects:
    - question: Career question
    - background: User background information (optional)
    - language: Language code (default: en)
    
    Returns:
        JSON with career advice
    """
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        question = data.get('question', '')
        background = data.get('background', {})
        language = data.get('language', 'en')
        
        if not question:
            return jsonify({"error": "Question is required"}), 400
        
        # Initialize DeepSeekClient
        deepseek_client = get_deepseek_client()
        
        # Generate career advice
        advice_results = deepseek_client.generate_career_advice(
            question=question,
            user_background=background,
            language=language
        )
        
        return jsonify(advice_results)
        
    except Exception as e:
        logger.error(f"Error generating career advice: {str(e)}")
        return jsonify({
            "error": f"Error generating career advice: {str(e)}",
            "status": "route_exception"
        }), 500

# Job matching endpoint
@app.route('/match-jobs', methods=['POST'])
def match_jobs():
    """
    Match resume against job listings
    
    Expects:
    - resume_text: Resume text content
    - job_listings: List of job listings
    - detailed: Whether to provide detailed analysis (default: false)
    
    Returns:
        JSON with matching results
    """
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        resume_text = data.get('resume_text', '')
        job_listings = data.get('job_listings', [])
        detailed = data.get('detailed', False)
        
        if not resume_text:
            return jsonify({"error": "Resume text is required"}), 400
        
        if not job_listings or not isinstance(job_listings, list):
            return jsonify({"error": "Job listings must be a non-empty list"}), 400
        
        # Initialize DeepSeekClient
        deepseek_client = get_deepseek_client()
        
        # Match jobs
        match_results = deepseek_client.match_jobs(
            resume_text=resume_text,
            job_listings=job_listings,
            detailed_analysis=detailed
        )
        
        return jsonify(match_results)
        
    except Exception as e:
        logger.error(f"Error matching jobs: {str(e)}")
        return jsonify({
            "error": f"Error matching jobs: {str(e)}",
            "status": "route_exception"
        }), 500

# Test connection endpoint
@app.route('/test-connection', methods=['GET'])
def test_connection():
    """
    Test connection to DeepSeek API
    
    Returns:
        JSON with connection status
    """
    try:
        # Initialize DeepSeekClient
        deepseek_client = get_deepseek_client()
        
        # Test connection
        test_result = deepseek_client.test_connection()
        
        return jsonify(test_result)
        
    except Exception as e:
        logger.error(f"Error testing connection: {str(e)}")
        return jsonify({
            "error": f"Error testing connection: {str(e)}",
            "connected": False,
            "status": "exception"
        }), 500

if __name__ == '__main__':
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Start PredictAPI Server')
    parser.add_argument('--port', type=int, default=5003, help='Port to run the server on')
    parser.add_argument('--host', type=str, default='0.0.0.0', help='Host to run the server on')
    parser.add_argument('--debug', action='store_true', help='Run in debug mode')
    parser.add_argument('--use-mock', action='store_true', help='Force using mock data')
    
    args = parser.parse_args()
    
    # Set environment variables
    if args.use_mock:
        os.environ['USE_MOCK_DATA'] = 'true'
        logger.info("Forcing mock data mode")
    
    # Use environment PORT variable if set (for cloud deployment), otherwise use args.port
    port = int(os.environ.get('PORT', args.port))
    
    # Start server
    logger.info(f"Starting PredictAPI Server on {args.host}:{port}")
    app.run(host=args.host, port=port, debug=args.debug) 