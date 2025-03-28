"""
Assessment Routes Module

This module provides API endpoints for career assessments including 
personality, interests, and work values.
"""

import logging
from datetime import datetime
from flask import Blueprint, request, jsonify

# Import auth utilities
from api.utils.auth import auth_required, get_current_user

# Import database models
from api.database.models import User

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint
assessment_bp = Blueprint('assessment', __name__)

# Mock assessment data
PERSONALITY_QUESTIONS = [
    {"id": 1, "text": "I enjoy being in large social gatherings", "category": "extraversion"},
    {"id": 2, "text": "I prefer having a plan and sticking to it", "category": "conscientiousness"},
    {"id": 3, "text": "I am easily stressed by challenging situations", "category": "neuroticism"},
    {"id": 4, "text": "I enjoy trying new experiences", "category": "openness"},
    {"id": 5, "text": "I tend to trust people easily", "category": "agreeableness"}
]

INTEREST_QUESTIONS = [
    {"id": 1, "text": "I enjoy fixing mechanical things", "category": "realistic"},
    {"id": 2, "text": "I like to investigate why things happen", "category": "investigative"},
    {"id": 3, "text": "I enjoy creating art or music", "category": "artistic"},
    {"id": 4, "text": "I like helping people solve their problems", "category": "social"},
    {"id": 5, "text": "I enjoy persuading others to follow my ideas", "category": "enterprising"},
    {"id": 6, "text": "I like working with numbers and data", "category": "conventional"}
]

VALUE_QUESTIONS = [
    {"id": 1, "text": "It's important to me to have a high income", "category": "financial"},
    {"id": 2, "text": "I want a job that allows for creativity", "category": "creativity"},
    {"id": 3, "text": "Work-life balance is essential to me", "category": "balance"},
    {"id": 4, "text": "I want to help others through my work", "category": "altruism"},
    {"id": 5, "text": "Career advancement opportunities are very important", "category": "achievement"}
]


@assessment_bp.route('/personality/questions', methods=['GET'])
@auth_required
def get_all_personality_questions():
    """Get all personality assessment questions"""
    try:
        return jsonify({
            'success': True,
            'data': {
                'questions': PERSONALITY_QUESTIONS
            }
        })
    
    except Exception as e:
        logger.error(f"Failed to get personality questions: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get personality questions'
        }), 500


@assessment_bp.route('/interests/questions', methods=['GET'])
@auth_required
def get_all_interest_questions():
    """Get all interest assessment questions"""
    try:
        return jsonify({
            'success': True,
            'data': {
                'questions': INTEREST_QUESTIONS
            }
        })
    
    except Exception as e:
        logger.error(f"Failed to get interest questions: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get interest questions'
        }), 500


@assessment_bp.route('/values/questions', methods=['GET'])
@auth_required
def get_all_value_questions():
    """Get all work value assessment questions"""
    try:
        return jsonify({
            'success': True,
            'data': {
                'questions': VALUE_QUESTIONS
            }
        })
    
    except Exception as e:
        logger.error(f"Failed to get value questions: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get value questions'
        }), 500


@assessment_bp.route('/comprehensive', methods=['POST'])
@auth_required
def complete_comprehensive_assessment():
    """Process a comprehensive career assessment"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Validate request data
        required_fields = ['personality_responses', 'interest_responses', 'value_responses']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Get current user
        user = get_current_user()
        
        # Process assessment responses
        personality_traits = process_personality_responses(data['personality_responses'])
        interest_areas = process_interest_responses(data['interest_responses'])
        work_values = process_value_responses(data['value_responses'])
        
        # Generate recommended career paths
        recommended_careers = generate_career_recommendations(
            personality_traits,
            interest_areas,
            work_values
        )
        
        # Create assessment result
        assessment_result = {
            'user_id': user.id,
            'personality_traits': personality_traits,
            'interest_areas': interest_areas,
            'work_values': work_values,
            'recommended_careers': recommended_careers,
            'completed_at': str(datetime.now())
        }
        
        # In a real implementation, you'd save these results to the database
        
        return jsonify({
            'success': True,
            'data': assessment_result
        })
    
    except Exception as e:
        logger.error(f"Failed to process assessment: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to process assessment'
        }), 500


# Helper functions (mock implementations)

def process_personality_responses(responses):
    """Process personality assessment responses"""
    # This is a simplified mock implementation
    return {
        'extraversion': 0.7,
        'conscientiousness': 0.8,
        'neuroticism': 0.3,
        'openness': 0.9,
        'agreeableness': 0.6
    }


def process_interest_responses(responses):
    """Process interest assessment responses"""
    # This is a simplified mock implementation
    return {
        'realistic': 0.5,
        'investigative': 0.8,
        'artistic': 0.7,
        'social': 0.9,
        'enterprising': 0.6,
        'conventional': 0.4
    }


def process_value_responses(responses):
    """Process work value assessment responses"""
    # This is a simplified mock implementation
    return {
        'financial': 0.7,
        'creativity': 0.8,
        'balance': 0.9,
        'altruism': 0.6,
        'achievement': 0.8
    }


def generate_career_recommendations(personality_traits, interest_areas, work_values):
    """Generate career recommendations based on assessment results"""
    # This is a simplified mock implementation
    return [
        {
            'title': 'Data Scientist',
            'match_score': 0.92,
            'description': 'Analyzes and interprets complex data to help guide business decisions.',
            'skills_required': ['Python', 'Machine Learning', 'Statistics', 'Data Visualization'],
            'education': 'Bachelor\'s or Master\'s in Computer Science, Statistics, or related field',
            'salary_range': {'min': 90000, 'max': 150000}
        },
        {
            'title': 'UX/UI Designer',
            'match_score': 0.87,
            'description': 'Creates engaging and effective user experiences for digital products.',
            'skills_required': ['User Research', 'Wireframing', 'Prototyping', 'Visual Design'],
            'education': 'Bachelor\'s in Design, HCI, or related field',
            'salary_range': {'min': 75000, 'max': 120000}
        },
        {
            'title': 'Product Manager',
            'match_score': 0.85,
            'description': 'Oversees product development from conception to launch and beyond.',
            'skills_required': ['Product Strategy', 'Market Research', 'Project Management', 'Communication'],
            'education': 'Bachelor\'s in Business, Computer Science, or related field',
            'salary_range': {'min': 85000, 'max': 140000}
        }
    ] 