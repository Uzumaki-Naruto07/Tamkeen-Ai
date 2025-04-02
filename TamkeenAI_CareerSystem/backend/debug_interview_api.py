import os
import json
import logging
import datetime
import random
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS  # Import Flask-CORS

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

# Add QA pairs for better default responses
interview_qa_pairs = [
    {
        "keywords": ["tell", "about", "yourself", "background"],
        "response": "That's a great introduction question! When answering 'Tell me about yourself,' focus on your professional background, key achievements, and relevant skills rather than personal details. Keep it concise (60-90 seconds) and align your experience with the job requirements. End with why you're interested in this specific role or company. This question sets the tone for the entire interview, so practice a smooth delivery that sounds natural, not rehearsed."
    },
    {
        "keywords": ["strength", "strengths", "weakness", "weaknesses"],
        "response": "When discussing strengths, choose 2-3 qualities relevant to the position and provide specific examples that demonstrate them. For weaknesses, show self-awareness by mentioning a genuine area for improvement, but focus on steps you're taking to address it. Avoid clichés like 'I'm a perfectionist' and never mention weaknesses that are essential to the job. This question tests your self-awareness and honesty."
    },
    {
        "keywords": ["why", "interested", "role", "position", "job"],
        "response": "Great question about your interest in the role! Your answer should demonstrate that you've researched the company and understand the position. Highlight how your skills and experience align with the job requirements, and express enthusiasm for the company's mission, culture, or recent achievements. Mention specific aspects of the role that appeal to you and how it fits into your career path. This shows the interviewer you're genuinely interested in the position, not just any job."
    },
    {
        "keywords": ["challenge", "difficult", "situation", "faced", "overcome"],
        "response": "When describing a challenging situation, use the STAR method (Situation, Task, Action, Result). Briefly explain the context, detail your specific responsibilities, describe the actions you took, and highlight the positive outcomes. Choose an example that showcases your problem-solving abilities, resilience, and key skills relevant to the job. The interviewer wants to understand how you handle difficulties and what you learned from the experience."
    },
    {
        "keywords": ["handle", "pressure", "stress", "deadline", "deadlines"],
        "response": "When answering how you handle pressure and deadlines, provide specific examples of high-pressure situations you've managed successfully. Describe your organizational system, prioritization methods, and stress management techniques. Emphasize your ability to remain calm and focused while maintaining quality work. If possible, quantify your success (e.g., 'met 95% of tight deadlines'). This question assesses your resilience and time management skills, which are crucial in fast-paced work environments."
    },
    {
        "keywords": ["team", "teamwork", "collaborate", "collaboration"],
        "response": "When discussing teamwork, provide a specific example of a successful team project using the STAR method. Highlight your collaborative skills, how you handled any conflicts, and your contribution to the team's success. Mention your adaptability in different team dynamics and your appreciation for diverse perspectives. The interviewer wants to gauge how well you work with others and your understanding that team success often outweighs individual accomplishments."
    },
    {
        "keywords": ["leadership", "lead", "team", "managed", "manager"],
        "response": "When discussing leadership experience, describe a specific situation where you led a team or project, focusing on your leadership style and how you motivated others. Explain the challenges you faced, the actions you took to overcome them, and the measurable results achieved. Even if you haven't had formal leadership roles, you can discuss situations where you took initiative or guided others. This question assesses your potential to grow into leadership positions and your ability to influence without authority."
    },
    {
        "keywords": ["goal", "goals", "achieve", "achievement", "achievements", "accomplished"],
        "response": "When discussing your achievements, select examples relevant to the position and use the STAR method to structure your answer. Quantify your achievements whenever possible (e.g., 'increased sales by 30%'). Demonstrate the skills you used to reach these goals and how they can benefit the prospective employer. Balance confidence with humility, and connect your past accomplishments to future contributions. This question helps employers predict your potential value to their organization."
    },
    {
        "keywords": ["conflict", "disagreement", "resolve", "team member"],
        "response": "When discussing conflict resolution, describe a specific workplace disagreement using the STAR method. Focus on your professional approach: explain how you listened actively, sought to understand different perspectives, and worked toward a compromise or solution. Emphasize the positive outcome and lessons learned. Avoid placing blame or speaking negatively about others involved. This question evaluates your interpersonal skills and emotional intelligence in challenging situations."
    },
    {
        "keywords": ["salary", "compensation", "expect", "expecting", "expectations"],
        "response": "When discussing salary expectations, demonstrate that you've researched standard compensation for the role in your location and industry. Provide a range rather than a specific figure, and emphasize that you're flexible and more interested in the overall opportunity. If possible, politely turn the question back to the interviewer by asking about their budgeted range. Remember that this question often comes up in later interview stages, so prepare in advance with market research to support your expected range."
    },
    {
        "keywords": ["why", "hire", "choose", "selected", "candidate"],
        "response": "When answering 'Why should we hire you?', concisely summarize your most relevant skills, experiences, and qualities that align with the job requirements. Differentiate yourself by highlighting unique strengths or combinations of skills. Use specific accomplishments as evidence of your potential contribution. Demonstrate enthusiasm for the role and organization, and convey confidence without arrogance. This question is your opportunity to deliver a compelling 'sales pitch' about the value you bring to the company."
    },
    {
        "keywords": ["5 years", "five years", "future", "plan", "plans", "career goals"],
        "response": "When discussing your five-year plan, show ambition balanced with realism. Articulate clear career progression that aligns with both your goals and potential paths within the company. Demonstrate commitment to professional growth through skills development and increased responsibilities. Express enthusiasm for long-term contribution without seeming like you'll quickly outgrow the current role. This question assesses your career planning, ambition level, and whether your goals align with what the organization can offer."
    },
    {
        "keywords": ["UAE", "Emirates", "region", "Middle East", "local"],
        "response": "When discussing working in the UAE, demonstrate your understanding of the region's business environment and cultural diversity. Highlight any relevant experience in multicultural settings, knowledge of regional business practices, or language skills like Arabic. Express genuine interest in the UAE's rapid development and initiatives like Vision 2030 or Emiratization. If you're new to the region, emphasize your adaptability, respect for local customs, and eagerness to learn. This shows the interviewer you're prepared for the unique aspects of working in the Emirates."
    },
    {
        "keywords": ["emiratization", "nationals", "emirati", "localization"],
        "response": "When discussing Emiratization, demonstrate your understanding that it's a national priority to increase UAE nationals' participation in the workforce, particularly in the private sector. Explain how you would support this initiative, whether by mentoring local colleagues, participating in knowledge transfer, or helping implement inclusive workplace practices. If you're an Emirati national, highlight how your skills contribute to the program's goals. This shows your awareness of important national policies and your willingness to participate in the country's development plans."
    }
]

# Setup Flask app
app = Flask(__name__)
# Enable CORS for all routes and all origins
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": ["Content-Type", "Accept", "X-Requested-With"]}})

# Set debug mode
app.config['DEBUG'] = True

# Health check endpoint
@app.route('/health-check', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Debug Interview API server is running"})

# API routes - All prefixed with /api to match frontend expectations
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
    
    # Fallback responses if no good match
    fallback_responses = [
        "That's an excellent question about interview preparation. When approaching this topic, focus on specific examples from your experience that demonstrate your skills and achievements. Remember to use the STAR method (Situation, Task, Action, Result) to structure your answer clearly and concisely.",
        
        "This is a common interview question. To answer effectively, I recommend preparing 2-3 specific examples that highlight your relevant skills and achievements. Keep your response concise (about 1-2 minutes) and make sure to connect your experience directly to the requirements of the position you're applying for.",
        
        "Great question! When answering this in an interview, be honest while maintaining professionalism. Provide concrete examples that demonstrate your skills and how you've applied them in previous roles. Remember that interviewers are looking for authenticity as well as capability.",
        
        "To address this kind of question successfully, research the company thoroughly before your interview. Understand their values, mission, and recent projects, then frame your answer to show alignment between your experience and their needs. This demonstrates your genuine interest in the specific role.",
        
        "When responding to this question in an interview, balance confidence with humility. Share specific accomplishments relevant to the role, quantify your achievements when possible, and explain how your experience has prepared you for the challenges of this position."
    ]
    
    return random.choice(fallback_responses)

@app.route('/api/interviews/message', methods=['POST'])
def send_message():
    logger.info("Received request to send message")
    data = request.json
    conversation_id = data.get('conversationId')
    
    # Debug log the incoming data
    logger.info(f"Message data received: {data}")
    
    # Get message content from either the message field or the content field
    message_content = data.get('message')
    if isinstance(message_content, dict):
        message_content = message_content.get('content') or message_content.get('message', 'No content provided')
    elif not message_content:
        # Try other possible fields
        message_content = data.get('content', 'No content provided')
    
    # Debug log the extracted message content
    logger.info(f"Extracted message content: {message_content}")
    
    # Add model info for response
    model = data.get('model', 'default')
    use_deepseek = data.get('useDeepSeek', False)
    
    logger.info(f"Using model: {model}, DeepSeek enabled: {use_deepseek}")
    
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
    
    # Generate intelligent response based on the question
    response_content = find_best_answer(message_content)
    
    # Create assistant response
    assistant_response = {
        "role": "assistant",
        "content": response_content,
        "timestamp": datetime.datetime.now().isoformat(),
        "model": "DeepSeek-AI" if use_deepseek else "Coach-AI"
    }
    conversation['messages'].append(assistant_response)
    
    # Log the response being sent
    logger.info(f"Sending response: {assistant_response}")
    
    # Send response back to client
    return jsonify({
        "data": {
            "message": response_content,
            "content": response_content,  # Include both formats for compatibility
            "role": "assistant",
            "timestamp": assistant_response["timestamp"],
            "model": assistant_response["model"]
        }
    }), 200

@app.route('/api/interviews/conversation/<conversation_id>', methods=['GET'])
def load_conversation(conversation_id):
    if conversation_id not in conversations:
        return jsonify({"error": "Conversation not found"}), 404
    
    return jsonify({"data": {
        "conversationId": conversation_id,
        "messages": conversations[conversation_id].get('messages', [])
    }}), 200

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
        "conversationId": conv_id,
        "messages": [greeting]
    }}), 201

@app.route('/api/interviews/category-questions/<category_id>', methods=['GET'])
def get_category_questions(category_id):
    category_questions = {
        "t1": [
            "Tell me about a time you had to resolve a conflict in your team.",
            "How do you handle tight deadlines and pressure?",
            "Describe a situation where you failed and how you handled it.",
            "What's your approach to working with difficult team members?"
        ],
        "t2": [
            "Explain a challenging technical problem you solved recently.",
            "How do you stay updated with the latest technologies?",
            "Describe your experience with cloud platforms like AWS or Azure.",
            "How would you explain a complex technical concept to a non-technical person?"
        ],
        "t3": [
            "What would you do if your team disagreed with your approach?",
            "How would you handle a situation where you're given conflicting priorities?",
            "If you noticed a colleague was struggling, how would you approach helping them?",
            "What would you do if you realized you wouldn't meet an important deadline?"
        ],
        "t4": [
            "Describe your communication style when working in a team.",
            "How do you ensure effective communication with remote team members?",
            "Tell me about a time you had to communicate a difficult message.",
            "How do you adapt your communication style for different audiences?"
        ],
        "t5": [
            "Describe your leadership style with an example.",
            "Tell me about a time you led a team through a difficult situation.",
            "How do you motivate team members who are facing challenges?",
            "What approaches do you use to build team cohesion and trust?"
        ]
    }
    
    return jsonify({"data": category_questions.get(category_id, [
        "Tell me about a time you had to resolve a conflict in your team.",
        "How do you handle tight deadlines and pressure?",
        "Describe a situation where you failed and how you handled it.",
        "What's your approach to working with difficult team members?"
    ])}), 200

@app.route('/api/interviews/mock-interview', methods=['POST'])
def create_mock_interview():
    data = request.json
    job_title = data.get('jobTitle', 'General')
    
    # Different questions based on job title
    mock_questions = {
        "Data Scientist": [
            "Tell me about your experience with machine learning algorithms.",
            "Describe a data cleaning process you've implemented.",
            "How do you approach feature selection?",
            "Explain a challenging data project you've worked on.",
            "How do you evaluate model performance?"
        ],
        "Software Engineer": [
            "Describe your experience with CI/CD pipelines.",
            "How do you ensure code quality?",
            "Tell me about a complex bug you solved.",
            "How do you approach learning new technologies?",
            "Describe your experience with agile development methodologies."
        ],
        "Project Manager": [
            "How do you handle scope creep?",
            "Describe your approach to risk management.",
            "Tell me about a challenging project you managed.",
            "How do you prioritize tasks when resources are limited?",
            "How do you keep stakeholders informed about project progress?"
        ],
        "UX/UI Designer": [
            "How do you incorporate user feedback into your designs?",
            "Describe your design process from concept to implementation.",
            "Tell me about a design challenge you overcame.",
            "How do you balance user needs with business requirements?",
            "How do you stay updated on design trends?"
        ]
    }
    
    # Default questions if job title not found
    default_questions = [
        "Tell me about yourself and your background.",
        "Why are you interested in this role?",
        "What are your greatest strengths and weaknesses?",
        "Tell me about a challenging situation you faced at work.",
        "Where do you see yourself in 5 years?"
    ]
    
    return jsonify({
        "data": {
            "mockInterviewId": f"mock_{len(conversations) + 1}",
            "questions": mock_questions.get(job_title, default_questions)
        }
    }), 201

@app.route('/api/interviews/mock-interview-setup', methods=['POST'])
def create_mock_interview_setup():
    return jsonify({"data": {"success": True}}), 200

@app.route('/api/interviews/premium-feedback', methods=['POST'])
def get_premium_feedback():
    data = request.json
    user_input = data.get('userInput', '')
    
    # Generate feedback based on the length and structure of the input
    word_count = len(user_input.split())
    
    # Determine STAR compliance
    contains_situation = any(word in user_input.lower() for word in ['situation', 'context', 'background'])
    contains_task = any(word in user_input.lower() for word in ['task', 'goal', 'objective', 'responsibility'])
    contains_action = any(word in user_input.lower() for word in ['action', 'approach', 'steps', 'implemented', 'did'])
    contains_result = any(word in user_input.lower() for word in ['result', 'outcome', 'impact', 'achievement', 'learned'])
    
    star_elements = [contains_situation, contains_task, contains_action, contains_result].count(True)
    star_rating = min(5, max(1, star_elements + 1))
    
    # Determine confidence score
    confidence_words = ['confident', 'certain', 'sure', 'know', 'believe', 'convinced', 'achieved', 'led', 'managed', 'implemented']
    weak_words = ['maybe', 'perhaps', 'might', 'guess', 'think', 'possibly', 'try', 'somewhat', 'kind of', 'sort of']
    
    confidence_count = sum(word in user_input.lower() for word in confidence_words)
    weak_count = sum(word in user_input.lower() for word in weak_words)
    
    confidence_score = min(10, max(1, 5 + confidence_count - weak_count))
    
    # Generate feedback based on the analysis
    soft_skills_feedback = ""
    if word_count < 50:
        soft_skills_feedback = "Your answer is quite brief. Consider expanding with more specific details and examples to fully demonstrate your skills and experience."
    elif word_count > 200:
        soft_skills_feedback = "Your answer is comprehensive but could be more concise. Focus on the most relevant points to keep the interviewer engaged."
    else:
        soft_skills_feedback = "Your response is well-balanced in length. You've provided enough detail while staying concise and focused."
    
    star_feedback = ""
    if star_rating <= 2:
        star_feedback = "Your answer could benefit from a clearer STAR structure. Try to explicitly include the Situation, Task, Action, and Result components to make your example more impactful."
    elif star_rating <= 4:
        star_feedback = "Your answer includes some elements of the STAR format. To strengthen it further, make sure to clearly distinguish between each component, especially highlighting the results you achieved."
    else:
        star_feedback = "Excellent use of the STAR method! Your answer clearly outlines the Situation, Task, Action, and Result, making it easy for the interviewer to follow and appreciate your accomplishments."
    
    suggestions = ""
    if confidence_score < 5:
        suggestions = "Replace tentative phrases like 'I think' or 'maybe' with more confident language such as 'I implemented' or 'I achieved'. Speak with conviction about your accomplishments and skills."
    elif word_count < 50:
        suggestions = "Add more specific details and quantify your achievements where possible (e.g., 'increased efficiency by 30%'). This adds credibility to your answer."
    else:
        suggestions = "Continue highlighting measurable results and connecting your experiences directly to the requirements of the role you're applying for."
    
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
    port = 5001  # Change port back to 5001
    logger.info(f"Starting debug interview API server on port {port}")
    app.run(debug=True, port=port, host='0.0.0.0') 