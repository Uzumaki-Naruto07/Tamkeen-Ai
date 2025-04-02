from flask import Blueprint, request, jsonify
import logging
from api.middleware.auth_middleware import token_required
from api.services.interview_service import InterviewService

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
interview_bp = Blueprint('interview', __name__)

# Initialize interview service
interview_service = InterviewService()

@interview_bp.route('/interview/hello', methods=['GET'])
def hello():
    """Test endpoint"""
    return jsonify({"message": "Hello from interview API!"}), 200

@interview_bp.route('/interview/protected', methods=['GET'])
@token_required
def protected(current_user):
    """Protected test endpoint"""
    return jsonify({"message": "This is a protected endpoint", "user": current_user}), 200

@interview_bp.route('/interview/start', methods=['POST'])
@token_required
def start_interview(current_user):
    """Start a new interview session"""
    data = request.json
    role = data.get('role', 'General')
    num_questions = data.get('num_questions', 5)
    coach_persona = data.get('coach_persona', 'zayd')
    sector_context = data.get('sector_context')
    
    result = interview_service.start_interview_session(
        role=role,
        user_id=current_user['id'],
        num_questions=num_questions,
        coach_persona=coach_persona,
        sector_context=sector_context
    )
    
    return jsonify(result), 200

@interview_bp.route('/interview/submit_answer/<session_id>', methods=['POST'])
@token_required
def submit_answer(current_user, session_id):
    """Submit an answer for the current question"""
    data = request.json
    answer_text = data.get('answer_text', '')
    emotion_analysis = data.get('emotion_analysis')
    
    result = interview_service.submit_answer(
        session_id=session_id,
        answer_text=answer_text,
        emotion_analysis=emotion_analysis
    )
    
    return jsonify(result), 200

@interview_bp.route('/interview/current_question/<session_id>', methods=['GET'])
@token_required
def get_current_question(current_user, session_id):
    """Get the current question for an interview session"""
    result = interview_service.get_current_question(session_id)
    return jsonify(result), 200

@interview_bp.route('/interview/analysis/<session_id>', methods=['GET'])
@token_required
def get_interview_analysis(current_user, session_id):
    """Get analysis for a completed interview session"""
    result = interview_service.get_interview_analysis(session_id)
    return jsonify(result), 200

@interview_bp.route('/interview/sessions', methods=['GET'])
@token_required
def list_interview_sessions(current_user):
    """List all interview sessions for the current user"""
    result = interview_service.list_interview_sessions(current_user['id'])
    return jsonify(result), 200

@interview_bp.route('/interview/cultural_tips/<sector>', methods=['GET'])
def get_cultural_tips(sector):
    """Get UAE cultural tips for a specific sector"""
    tips = interview_service.get_uae_cultural_tips(sector)
    return jsonify({"sector": sector, "tips": tips}), 200

@interview_bp.route('/interview/coach_personas', methods=['GET'])
def get_coach_personas():
    """Get available coach personas"""
    personas = interview_service.get_coach_personas()
    return jsonify(personas), 200

@interview_bp.route('/interview/local_companies', methods=['GET'])
def get_local_companies():
    """Get list of prominent UAE companies"""
    companies = interview_service.get_local_companies()
    return jsonify(companies), 200

@interview_bp.route('/interview/generate_questions', methods=['POST'])
@token_required
def generate_interview_questions(current_user):
    """Generate role-specific interview questions"""
    data = request.json
    role = data.get('role', 'General')
    num_questions = data.get('num_questions', 5)
    sector_context = data.get('sector_context')
    is_uae_focused = data.get('is_uae_focused', False)
    
    questions = interview_service.generate_interview_questions(
        role=role,
        num_questions=num_questions,
        sector_context=sector_context,
        is_uae_focused=is_uae_focused
    )
    
    return jsonify({"role": role, "questions": questions}), 200
