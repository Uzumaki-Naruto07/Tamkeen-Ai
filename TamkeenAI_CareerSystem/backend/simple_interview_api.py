#!/usr/bin/env python3
"""
Simple Interview API for TamkeenAI
This is a streamlined version of the debug_interview_api.py that runs on port 5001
"""

import os
import json
import logging
import datetime
import random
import argparse
import requests
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize data store (in-memory)
conversations = {}
mock_topics = [
    {"id": "t1", "name": "Behavioral Questions", "count": 28},
    {"id": "t2", "name": "Technical Skills", "count": 42},
    {"id": "t3", "name": "Situational Scenarios", "count": 15},
    {"id": "t4", "name": "Communication", "count": 19},
    {"id": "t5", "name": "Leadership & Teamwork", "count": 23}
]

mock_suggested_questions = [
    "Tell me about yourself and your background.",
    "What are your greatest strengths and weaknesses?",
    "Why are you interested in this role?",
    "Describe a challenging situation you faced at work.",
    "How do you handle pressure and tight deadlines?"
]

# QA pairs for better responses
interview_qa_pairs = [
    {
        "keywords": ["tell", "about", "yourself", "background"],
        "response": "That's a great introduction question! When answering 'Tell me about yourself,' focus on your professional background, key achievements, and relevant skills rather than personal details. Keep it concise (60-90 seconds) and align your experience with the job requirements."
    },
    {
        "keywords": ["strength", "strengths", "weakness", "weaknesses"],
        "response": "When discussing strengths, choose 2-3 qualities relevant to the position and provide specific examples that demonstrate them. For weaknesses, show self-awareness by mentioning a genuine area for improvement, but focus on steps you're taking to address it."
    },
    {
        "keywords": ["why", "interested", "role", "position", "job"],
        "response": "Great question about your interest in the role! Your answer should demonstrate that you've researched the company and understand the position. Highlight how your skills and experience align with the job requirements, and express enthusiasm for the company's mission."
    }
]

# Setup Flask app
app = Flask(__name__)

# Use very permissive CORS settings for development
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": ["Content-Type", "Accept", "X-Requested-With"], "methods": ["GET", "POST", "OPTIONS"]}})

# DeepSeek API configuration
DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY', '')
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/models/deepseek-coder/generate"

@app.route('/health-check', methods=['GET'])
def health_check():
    port = int(os.environ.get('PORT', 5001))
    return jsonify({"status": "ok", "message": f"Simple Interview API is running on port {port}"})

@app.route('/api/health-check', methods=['GET'])
def api_health_check():
    port = int(os.environ.get('PORT', 5001))
    return jsonify({"status": "ok", "message": f"Simple Interview API is running on port {port}"})

@app.route('/api/interviews/conversation', methods=['POST'])
def create_or_load_conversation():
    logger.info("Received request to create/load conversation")
    data = request.json
    user_id = data.get('userId', 'test-user')
    
    # Check if user has an existing conversation
    for conv_id, conv in conversations.items():
        if conv.get('userId') == user_id and conv.get('active', True):
            return jsonify({"data": {
                "conversationId": conv_id,
                "messages": conv.get('messages', [])
            }}), 200
    
    # Create new conversation
    logger.info(f"Creating new conversation for user {user_id}")
    conv_id = f"conv_{len(conversations) + 1}"
    timestamp = datetime.datetime.now().isoformat()
    
    # Initial greeting
    greeting = {
        "role": "assistant",
        "content": "Hello! I am your AI interview coach. How can I help you today? You can ask me about interview techniques, common questions, or how to prepare for specific roles.",
        "timestamp": timestamp
    }
    
    conversations[conv_id] = {
        "userId": user_id,
        "active": True,
        "messages": [greeting],
        "created_at": timestamp
    }
    
    return jsonify({"data": {
        "conversationId": conv_id,
        "messages": [greeting]
    }}), 201

@app.route('/api/interviews/conversations/<user_id>', methods=['GET'])
def get_previous_conversations(user_id):
    logger.info(f"Received request to get previous conversations for user {user_id}")
    
    user_conversations = []
    for conv_id, conv in conversations.items():
        if conv.get('userId') == user_id:
            user_conversations.append({
                "id": conv_id,
                "title": f"Interview Conversation {conv_id}",
                "date": conv.get('created_at'),
                "messages": conv.get('messages', [])
            })
    
    return jsonify({"data": user_conversations}), 200

@app.route('/api/interviews/topics', methods=['GET'])
def get_interview_topics():
    logger.info("Received request to get interview topics")
    return jsonify({"data": mock_topics}), 200

@app.route('/api/interviews/suggested-questions/<user_id>', methods=['GET'])
def get_suggested_questions(user_id):
    logger.info(f"Received request to get suggested questions for user {user_id}")
    return jsonify({"data": mock_suggested_questions}), 200

@app.route('/api/interviews/conversation/new', methods=['POST'])
def create_new_conversation():
    data = request.json
    user_id = data.get('userId', 'test-user')
    
    # Create new conversation
    conv_id = f"conv_{len(conversations) + 1}"
    timestamp = datetime.datetime.now().isoformat()
    
    # Initial greeting
    greeting = {
        "role": "assistant",
        "content": "Hello! I am your AI interview coach. How can I help you today?",
        "timestamp": timestamp
    }
    
    conversations[conv_id] = {
        "userId": user_id,
        "active": True,
        "messages": [greeting],
        "created_at": timestamp
    }
    
    return jsonify({"data": {
        "conversationId": conv_id
    }}), 201

# Find best matching answer based on keywords
def find_best_answer(query):
    query = query.lower()
    best_match = None
    max_score = 0
    
    for qa_pair in interview_qa_pairs:
        score = 0
        for keyword in qa_pair["keywords"]:
            if keyword.lower() in query:
                score += 1
        
        if score > max_score:
            max_score = score
            best_match = qa_pair
    
    # If we found a good match
    if max_score >= 2:
        return best_match["response"]
    
    # Fallback responses
    fallback_responses = [
        "That's an excellent question about interview preparation. When approaching this topic, focus on specific examples from your experience that demonstrate your skills and achievements.",
        "This is a common interview question. To answer effectively, I recommend preparing 2-3 specific examples that highlight your relevant skills and achievements.",
        "Great question! When answering this in an interview, be honest while maintaining professionalism. Provide concrete examples that demonstrate your skills."
    ]
    
    return random.choice(fallback_responses)

@app.route('/api/interviews/message', methods=['POST'])
def send_message():
    logger.info("Received request to send message")
    data = request.json
    conversation_id = data.get('conversationId')
    
    # Get message content from either the message field or the content field
    message_content = data.get('message')
    if isinstance(message_content, dict):
        message_content = message_content.get('content', 'No content provided')
    
    # Handle empty messages
    if not message_content or message_content == 'No content provided':
        message_content = "Please provide advice about this interview question."
        logger.info("Empty message received, using default content")
    
    # Check which AI provider to use
    use_openai = data.get('useOpenAI', True)
    use_deepseek = data.get('useDeepSeek', False)
    
    logger.info(f"AI provider selection: OpenAI={use_openai}, DeepSeek={use_deepseek}")
    
    if not conversation_id or conversation_id not in conversations:
        # Create a new conversation if not found
        logger.info(f"Creating new conversation for invalid ID: {conversation_id}")
        user_id = data.get('userId', 'unknown-user')
        conv_id = f"conv_{len(conversations) + 1}"
        timestamp = datetime.datetime.now().isoformat()
        
        # Initial greeting
        greeting = {
            "role": "assistant",
            "content": "Hello! I am your AI interview coach. How can I help you today?",
            "timestamp": timestamp
        }
        
        conversations[conv_id] = {
            "userId": user_id,
            "active": True,
            "messages": [greeting],
            "created_at": timestamp
        }
        
        conversation_id = conv_id
    
    # Get conversation
    conversation = conversations[conversation_id]
    
    # Add user message
    user_message = {
        "role": "user",
        "content": message_content,
        "timestamp": datetime.datetime.now().isoformat()
    }
    conversation['messages'].append(user_message)
    
    # Generate response based on selected AI provider
    response_content = ""
    model_used = ""
    
    try:
        if use_openai:
            # Simulate OpenAI response
            response_content = find_best_answer(message_content)
            model_used = "OpenAI"
            logger.info("Using OpenAI for response generation")
        elif use_deepseek:
            # Simulate DeepSeek response
            response_content = f"[DeepSeek] {find_best_answer(message_content)}"
            model_used = "DeepSeek"
            logger.info("Using DeepSeek for response generation")
        else:
            # Default fallback
            response_content = find_best_answer(message_content)
            model_used = "Local AI"
            logger.info("Using local AI for response generation")
    except Exception as e:
        logger.error(f"Error generating AI response: {str(e)}")
        response_content = "I apologize, but I'm having trouble generating a response. Please try again with a different question."
        model_used = "Fallback"
    
    # Create assistant message
    assistant_message = {
        "role": "assistant",
        "content": response_content,
        "timestamp": datetime.datetime.now().isoformat(),
        "model": model_used
    }
    conversation['messages'].append(assistant_message)
    
    return jsonify(assistant_message), 200

@app.route('/api/interviews/premium-feedback', methods=['POST'])
def get_premium_feedback():
    logger.info("Received request for premium feedback")
    
    # Generate random star rating and confidence score for demo
    star_rating = random.randint(2, 5)
    confidence_score = random.randint(5, 9)
    
    # Mock feedback for demo
    soft_skills_feedback = "Your communication style is professional and articulate. Consider speaking more slowly and using more confident body language."
    star_feedback = "Your answer follows the STAR method well, but could use more emphasis on the Results section."
    suggestions = "Be more specific about your achievements and use metrics when possible. Practice maintaining eye contact."
    
    return jsonify({
        "data": {
            "starRating": star_rating,
            "confidenceScore": confidence_score,
            "softSkills": soft_skills_feedback,
            "starPattern": star_feedback,
            "suggestions": suggestions
        }
    }), 200

@app.route('/api/interviews/save-feedback', methods=['POST'])
def save_feedback():
    return jsonify({"data": {"success": True}}), 200

@app.route('/api/chat/ai/recommendation', methods=['POST'])
def get_ai_recommendation():
    logger.info("Received request for AI recommendation")
    data = request.json
    prompt = data.get('prompt', '')
    
    # Mock response for AI recommendation
    recommendation = {
        "recommendation": "Based on my analysis, I recommend highlighting your achievements with specific metrics. For example, instead of saying 'Improved team productivity', say 'Increased team productivity by 27% over 6 months by implementing agile methodologies and automating routine tasks'.",
        "improvement_areas": ["Be more specific", "Use metrics", "Focus on outcomes"],
        "model_used": "TamkeenAI Interview Analyzer"
    }
    
    # Log the request and response for debugging
    logger.info(f"AI recommendation request with prompt: {prompt[:50]}...")
    logger.info(f"AI recommendation response provided")
    
    return jsonify(recommendation), 200

# Add DeepSeek analysis endpoint
@app.route('/api/interview/analyze-with-deepseek', methods=['POST', 'OPTIONS'])
def analyze_interview_with_deepseek():
    # Handle CORS preflight request
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        return response
        
    try:
        # Log request details for debugging
        logger.info(f"Received analyze-with-deepseek request from {request.remote_addr}")
        logger.info(f"Request headers: {request.headers}")
        logger.info(f"Request json: {request.json}")
        
        data = request.json
        if not data or 'transcript' not in data:
            return jsonify({'error': 'Missing transcript data'}), 400
            
        transcript = data.get('transcript', '')
        question = data.get('question', '')
        job_role = data.get('jobRole', 'Software Developer')
        
        # Create a prompt for DeepSeek to analyze the interview response
        prompt = f"""
        As an AI interview coach, analyze the following interview response for a {job_role} position.

        QUESTION: {question}
        
        CANDIDATE'S RESPONSE: {transcript}
        
        Provide detailed feedback in the following JSON format:
        {{
            "overallScore": <score from 0-100>,
            "technicalAccuracy": <score from 0-100>,
            "communicationClarity": <score from 0-100>,
            "relevance": <score from 0-100>,
            "strengths": [<list of strengths in the response>],
            "weaknesses": [<list of areas that need improvement>],
            "improvementTips": [<specific actionable advice to improve>],
            "category": <one of: "Excellent", "Good", "Average", "Needs Improvement", "Poor", "No Answer">
        }}
        """
        
        # Only proceed if we have a DeepSeek API key
        if not DEEPSEEK_API_KEY:
            # Fall back to local analysis if no API key
            logger.warning("DeepSeek API key not found, using local analysis")
            analysis_result = analyze_response_local(transcript, question, job_role)
            return jsonify(analysis_result)
        
        # Call DeepSeek API
        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "deepseek-coder",
            "prompt": prompt,
            "temperature": 0.3,
            "max_tokens": 1000
        }
        
        logger.info(f"Sending request to DeepSeek API for interview analysis")
        response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload)
        
        if response.status_code == 200:
            try:
                result = response.json()
                generated_text = result.get('text', '')
                
                # Extract the JSON from the generated text using regex
                import re
                json_match = re.search(r'\{[\s\S]*\}', generated_text)
                if json_match:
                    analysis_json = json.loads(json_match.group(0))
                    logger.info("Successfully analyzed interview with DeepSeek")
                    return jsonify(analysis_json)
                else:
                    logger.error("Could not parse JSON from DeepSeek response")
                    # Fall back to local analysis
                    analysis_result = analyze_response_local(transcript, question, job_role)
                    return jsonify(analysis_result)
            except Exception as e:
                logger.error(f"Error parsing DeepSeek response: {str(e)}")
                # Fall back to local analysis
                analysis_result = analyze_response_local(transcript, question, job_role)
                return jsonify(analysis_result)
        else:
            logger.error(f"DeepSeek API error: {response.status_code}, {response.text}")
            # Fall back to local analysis
            analysis_result = analyze_response_local(transcript, question, job_role)
            return jsonify(analysis_result)
                
    except Exception as e:
        logger.error(f"Error in DeepSeek interview analysis: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Local analysis function as fallback
def analyze_response_local(transcript, question, job_role):
    # Basic metrics
    word_count = len(transcript.split())
    
    # Default analysis object
    analysis = {
        "overallScore": 50,
        "technicalAccuracy": 50,
        "communicationClarity": 50,
        "relevance": 50,
        "strengths": ["Response provided"],
        "weaknesses": ["Analysis performed locally, not with AI"],
        "improvementTips": ["Set up DeepSeek API for better analysis"],
        "category": "Average"
    }
    
    # Very basic scoring based on word count
    if word_count < 5:
        analysis["overallScore"] = 10
        analysis["category"] = "Poor"
        analysis["weaknesses"].append("Response is too short")
    elif word_count < 20:
        analysis["overallScore"] = 30
        analysis["category"] = "Needs Improvement"
        analysis["weaknesses"].append("Response could be more detailed")
    elif word_count > 100:
        analysis["overallScore"] = 70
        analysis["category"] = "Good"
        analysis["strengths"].append("Provided a detailed response")
        
    return analysis

# Fix OPTIONS requests for CORS preflight
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    response = make_response()
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Simple Interview API Server')
    parser.add_argument('--port', type=int, default=5001,
                        help='Port to run the server on (default: 5001)')
    args = parser.parse_args()
    
    # Set port in environment for route messages
    os.environ['PORT'] = str(args.port)
    
    logger.info(f"Starting Simple Interview API server on port {args.port}")
    app.run(host='0.0.0.0', port=args.port) 