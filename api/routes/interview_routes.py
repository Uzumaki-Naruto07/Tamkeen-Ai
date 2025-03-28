"""
Interview Routes Module

This module provides API routes for interview preparation and practice.
"""

import logging
from flask import Blueprint, request, jsonify

# Import middleware
from api.middleware.auth_middleware import token_required

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint
interview_bp = Blueprint('interview', __name__)

@interview_bp.route('/questions', methods=['GET'])
def get_interview_questions():
    """Get interview questions based on job title or skills"""
    try:
        # Get query parameters
        job_title = request.args.get('job_title', '')
        skills = request.args.get('skills', '').split(',')
        category = request.args.get('category', '')
        
        # Filter out empty strings
        skills = [s.strip() for s in skills if s.strip()]
        
        # Generate questions (placeholder implementation)
        questions = []
        
        # General questions
        general_questions = [
            {
                'id': 1,
                'text': 'Tell me about yourself and your background.',
                'category': 'general',
                'difficulty': 'easy'
            },
            {
                'id': 2,
                'text': 'What are your greatest strengths and weaknesses?',
                'category': 'general',
                'difficulty': 'easy'
            },
            {
                'id': 3,
                'text': 'Why do you want to work for our company?',
                'category': 'general',
                'difficulty': 'medium'
            }
        ]
        
        # Technical questions
        technical_questions = [
            {
                'id': 4,
                'text': 'Explain the difference between an array and a linked list.',
                'category': 'technical',
                'difficulty': 'medium'
            },
            {
                'id': 5,
                'text': 'How would you optimize a slow website?',
                'category': 'technical',
                'difficulty': 'hard'
            },
            {
                'id': 6,
                'text': 'Explain RESTful API architecture.',
                'category': 'technical',
                'difficulty': 'medium'
            }
        ]
        
        # Behavioral questions
        behavioral_questions = [
            {
                'id': 7,
                'text': 'Tell me about a time you faced a challenging situation at work.',
                'category': 'behavioral',
                'difficulty': 'medium'
            },
            {
                'id': 8,
                'text': 'Describe a situation where you had to work with a difficult team member.',
                'category': 'behavioral',
                'difficulty': 'medium'
            },
            {
                'id': 9,
                'text': 'Give an example of a goal you achieved and how you achieved it.',
                'category': 'behavioral',
                'difficulty': 'medium'
            }
        ]
        
        # Filter questions based on category
        if category == 'general':
            questions.extend(general_questions)
        elif category == 'technical':
            questions.extend(technical_questions)
        elif category == 'behavioral':
            questions.extend(behavioral_questions)
        else:
            questions.extend(general_questions)
            questions.extend(technical_questions)
            questions.extend(behavioral_questions)
        
        # Return interview questions
        return jsonify({
            'success': True,
            'data': {
                'questions': questions
            }
        })
        
    except Exception as e:
        logger.error(f"Error in get_interview_questions: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@interview_bp.route('/feedback', methods=['POST'])
@token_required
def get_interview_feedback(current_user):
    """Get feedback on an interview answer"""
    try:
        # Get request data
        data = request.json
        
        # Validate input
        if not data or 'question' not in data or 'answer' not in data:
            return jsonify({
                'success': False,
                'error': 'Question and answer are required'
            }), 400
            
        # Extract data
        question = data.get('question', '')
        answer = data.get('answer', '')
        
        # Generate feedback (placeholder implementation)
        feedback = {
            'score': 85,
            'strengths': [
                'Clear and concise explanation',
                'Good use of examples',
                'Demonstrated knowledge of the subject'
            ],
            'areas_for_improvement': [
                'Could provide more specific details',
                'Consider addressing potential follow-up questions'
            ],
            'suggested_answer': 'A more comprehensive answer might include...',
            'keywords': ['relevant keyword 1', 'relevant keyword 2']
        }
        
        return jsonify({
            'success': True,
            'data': {
                'feedback': feedback
            }
        })
        
    except Exception as e:
        logger.error(f"Error in get_interview_feedback: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@interview_bp.route('/practice', methods=['POST'])
@token_required
def start_practice_interview(current_user):
    """Start a practice interview session"""
    try:
        # Get request data
        data = request.json
        
        # Validate input
        if not data or 'job_title' not in data:
            return jsonify({
                'success': False,
                'error': 'Job title is required'
            }), 400
            
        # Extract data
        job_title = data.get('job_title', '')
        duration = data.get('duration', 30)
        
        # Create a practice interview session (placeholder implementation)
        session = {
            'id': 'interview-123',
            'job_title': job_title,
            'duration': duration,
            'questions': [
                {
                    'id': 1,
                    'text': 'Tell me about yourself and your background.',
                    'category': 'general',
                    'time_allocated': 3
                },
                {
                    'id': 4,
                    'text': 'Explain the difference between an array and a linked list.',
                    'category': 'technical',
                    'time_allocated': 5
                },
                {
                    'id': 7,
                    'text': 'Tell me about a time you faced a challenging situation at work.',
                    'category': 'behavioral',
                    'time_allocated': 5
                }
            ],
            'status': 'created'
        }
        
        return jsonify({
            'success': True,
            'data': {
                'session': session
            }
        })
        
    except Exception as e:
        logger.error(f"Error in start_practice_interview: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500 