from flask import Blueprint, request, jsonify
import os
import uuid
import datetime
import json
from bson import ObjectId
from pymongo import MongoClient
import openai
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set up MongoDB connection
try:
    mongo_uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/')
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=3000)  # Add a shorter timeout
    # Test the connection
    client.server_info()  # This will raise an exception if not connected
    db = client['tamkeen_ai']
    conversations_collection = db['interview_conversations']
    topics_collection = db['interview_topics']
    questions_collection = db['interview_questions']
    feedback_collection = db['interview_feedback']
    
    # Initialize collections with default data if empty
    if topics_collection.count_documents({}) == 0:
        default_topics = [
            {"id": str(ObjectId()), "name": "Behavioral Questions", "count": 28},
            {"id": str(ObjectId()), "name": "Technical Skills", "count": 42},
            {"id": str(ObjectId()), "name": "Situational Scenarios", "count": 15},
            {"id": str(ObjectId()), "name": "Communication", "count": 19},
            {"id": str(ObjectId()), "name": "Leadership & Teamwork", "count": 23}
        ]
        topics_collection.insert_many(default_topics)
    
    if questions_collection.count_documents({}) == 0:
        default_questions = [
            {"question": "What are the most common interview questions for software engineers?", "category": "Technical Skills"},
            {"question": "How should I prepare for behavioral interviews?", "category": "Behavioral Questions"},
            {"question": "What's the best way to answer 'Tell me about yourself'?", "category": "Communication"},
            {"question": "How can I improve my communication during interviews?", "category": "Communication"},
            {"question": "What should I do if I don't know an answer?", "category": "Situational Scenarios"}
        ]
        questions_collection.insert_many(default_questions)
        
    logger.info("MongoDB connection established successfully")
    USING_MOCK_DATA = False
except Exception as e:
    logger.error(f"Error connecting to MongoDB: {e}")
    # Create fallback in-memory storage
    conversations_memory = []
    topics_memory = [
        {"id": "t1", "name": "Behavioral Questions", "count": 28},
        {"id": "t2", "name": "Technical Skills", "count": 42},
        {"id": "t3", "name": "Situational Scenarios", "count": 15},
        {"id": "t4", "name": "Communication", "count": 19},
        {"id": "t5", "name": "Leadership & Teamwork", "count": 23}
    ]
    questions_memory = [
        "What are the most common interview questions for software engineers?",
        "How should I prepare for behavioral interviews?",
        "What's the best way to answer 'Tell me about yourself'?",
        "How can I improve my communication during interviews?",
        "What should I do if I don't know an answer?"
    ]
    feedback_memory = []
    USING_MOCK_DATA = True
    logger.warning("Using in-memory storage fallback instead of MongoDB")

# Set up OpenAI
openai_api_key = os.environ.get('OPENAI_API_KEY')
if openai_api_key:
    openai.api_key = openai_api_key
    logger.info("OpenAI API key configured")
else:
    logger.warning("OpenAI API key not found")

# Create a Flask Blueprint for interviews with a unique name
interview_bp = Blueprint('interview_coach', __name__)

# Helper function for JSON serialization
def json_serialize(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, datetime.datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

# Create or load conversation
@interview_bp.route('/api/interviews/conversation', methods=['POST'])
def create_or_load_conversation():
    try:
        data = request.json
        user_id = data.get('userId')
        
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        # Try to find an existing conversation for this user
        existing_conversation = None
        
        try:
            existing_conversation = conversations_collection.find_one(
                {"user_id": user_id, "active": True},
                sort=[("created_at", -1)]
            )
        except Exception as e:
            logger.error(f"Error querying MongoDB: {e}")
            # Use in-memory fallback
            for conv in conversations_memory:
                if conv.get("user_id") == user_id and conv.get("active", True):
                    existing_conversation = conv
                    break
        
        if existing_conversation:
            # Return existing conversation
            return jsonify({
                "data": {
                    "conversationId": str(existing_conversation.get("_id", existing_conversation.get("id"))),
                    "messages": existing_conversation.get("messages", [])
                }
            }), 200
        else:
            # Create a new conversation
            conversation_id = str(ObjectId())
            created_at = datetime.datetime.utcnow()
            
            # Default greeting message
            greeting_message = {
                "role": "assistant",
                "content": "Hello! I'm your AI Interview Coach. I can help you prepare for interviews by providing advice, answering questions, and simulating interview scenarios. How can I assist you today?",
                "timestamp": created_at.isoformat()
            }
            
            new_conversation = {
                "_id": ObjectId(conversation_id),
                "id": conversation_id,
                "user_id": user_id,
                "title": "Interview Preparation",
                "created_at": created_at,
                "updated_at": created_at,
                "active": True,
                "messages": [greeting_message]
            }
            
            try:
                conversations_collection.insert_one(new_conversation)
            except Exception as e:
                logger.error(f"Error inserting into MongoDB: {e}")
                # Use in-memory fallback
                new_conversation["_id"] = conversation_id
                conversations_memory.append(new_conversation)
            
            return jsonify({
                "data": {
                    "conversationId": conversation_id,
                    "messages": [greeting_message]
                }
            }), 201
    
    except Exception as e:
        logger.error(f"Error in create_or_load_conversation: {e}")
        return jsonify({"error": str(e)}), 500

# Get previous conversations
@interview_bp.route('/api/interviews/conversations/<user_id>', methods=['GET'])
def get_previous_conversations(user_id):
    try:
        conversations = []
        
        try:
            # Query MongoDB
            cursor = conversations_collection.find(
                {"user_id": user_id},
                sort=[("updated_at", -1)]
            ).limit(10)
            
            for doc in cursor:
                conversations.append({
                    "id": str(doc.get("_id")),
                    "title": doc.get("title", "Interview Conversation"),
                    "date": doc.get("created_at").isoformat(),
                    "messages": doc.get("messages", [])[:1]  # Just include first message for preview
                })
        except Exception as e:
            logger.error(f"Error querying MongoDB for conversations: {e}")
            # Use in-memory fallback
            for conv in conversations_memory:
                if conv.get("user_id") == user_id:
                    conversations.append({
                        "id": conv.get("id"),
                        "title": conv.get("title", "Interview Conversation"),
                        "date": conv.get("created_at").isoformat(),
                        "messages": conv.get("messages", [])[:1]
                    })
        
        return jsonify({"data": conversations}), 200
    
    except Exception as e:
        logger.error(f"Error in get_previous_conversations: {e}")
        return jsonify({"error": str(e)}), 500

# Get interview topics
@interview_bp.route('/api/interviews/topics', methods=['GET'])
def get_interview_topics():
    try:
        topics = []
        
        try:
            # Query MongoDB
            cursor = topics_collection.find()
            for doc in cursor:
                topics.append({
                    "id": doc.get("id", str(doc.get("_id"))),
                    "name": doc.get("name"),
                    "count": doc.get("count", 0)
                })
        except Exception as e:
            logger.error(f"Error querying MongoDB for topics: {e}")
            # Use in-memory fallback
            topics = topics_memory
        
        return jsonify({"data": topics}), 200
    
    except Exception as e:
        logger.error(f"Error in get_interview_topics: {e}")
        return jsonify({"error": str(e)}), 500

# Get suggested questions
@interview_bp.route('/api/interviews/suggested-questions/<user_id>', methods=['GET'])
def get_suggested_questions(user_id):
    try:
        questions = []
        
        try:
            # Query MongoDB - in a real app, you'd personalize these based on user history
            cursor = questions_collection.find().limit(5)
            for doc in cursor:
                questions.append(doc.get("question"))
        except Exception as e:
            logger.error(f"Error querying MongoDB for questions: {e}")
            # Use in-memory fallback
            questions = questions_memory
        
        return jsonify({"data": questions}), 200
    
    except Exception as e:
        logger.error(f"Error in get_suggested_questions: {e}")
        return jsonify({"error": str(e)}), 500

# Send message
@interview_bp.route('/api/interviews/message', methods=['POST'])
def send_message():
    try:
        data = request.json
        conversation_id = data.get('conversationId')
        message = data.get('message')
        use_openai = data.get('useOpenAI', True)
        coach_persona = data.get('coachPersona', 'zayd')
        user_id = data.get('userId')
        
        if not conversation_id or not message:
            return jsonify({"error": "Conversation ID and message are required"}), 400
        
        # Get current timestamp
        timestamp = datetime.datetime.utcnow().isoformat()
        
        # Generate AI response
        ai_response = ""
        
        if use_openai and openai_api_key:
            try:
                # Prepare a prompt based on coach persona
                persona_prompts = {
                    'noora': "You are Noora, a UAE government sector interview specialist with expertise in Emiratization policies.",
                    'ahmed': "You are Ahmed, a tech industry interview coach with expertise in programming and system design.",
                    'fatima': "You are Fatima, specializing in helping women navigate career opportunities in the UAE.",
                    'zayd': "You are Zayd, an AI-driven interview coach specializing in analytical thinking and problem-solving."
                }
                
                # Get conversation history
                conversation_history = []
                try:
                    # Retrieve from MongoDB
                    conversation = conversations_collection.find_one({"_id": ObjectId(conversation_id)})
                    if conversation:
                        conversation_history = conversation.get("messages", [])
                except Exception as e:
                    logger.error(f"Error retrieving conversation: {e}")
                    # Use in-memory fallback
                    for conv in conversations_memory:
                        if conv.get("id") == conversation_id:
                            conversation_history = conv.get("messages", [])
                            break
                
                # Prepare OpenAI messages
                openai_messages = [
                    {"role": "system", "content": persona_prompts.get(coach_persona, persona_prompts['zayd'])}
                ]
                
                # Add conversation history (limit to last 10 messages to save tokens)
                for msg in conversation_history[-10:]:
                    if msg.get("role") in ["user", "assistant"]:
                        openai_messages.append({
                            "role": msg.get("role"),
                            "content": msg.get("content")
                        })
                
                # Add the new user message
                if isinstance(message, dict) and "content" in message:
                    openai_messages.append({
                        "role": "user",
                        "content": message.get("content")
                    })
                elif isinstance(message, str):
                    openai_messages.append({
                        "role": "user",
                        "content": message
                    })
                else:
                    openai_messages.append({
                        "role": "user",
                        "content": str(message)
                    })
                
                # Call OpenAI API
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",  # You can use "gpt-4" for better results
                    messages=openai_messages,
                    max_tokens=500,
                    temperature=0.7
                )
                
                ai_response = response.choices[0].message.content
            
            except Exception as e:
                logger.error(f"Error using OpenAI: {e}")
                ai_response = "I apologize, but I'm having trouble generating a response right now. Please try again or ask a different question."
        else:
            # Fallback response if OpenAI is not available
            ai_response = "I understand your question. To provide the best advice for interview preparation, I would recommend focusing on understanding the job description thoroughly, preparing specific examples from your experience, and practicing common interview questions relevant to your field."
        
        # Create AI response message
        ai_message = {
            "role": "assistant",
            "content": ai_response,
            "timestamp": timestamp
        }
        
        # Update conversation with user message and AI response
        user_message = {
            "role": "user",
            "content": message if isinstance(message, str) else message.get("content"),
            "timestamp": timestamp
        }
        
        try:
            # Update in MongoDB
            conversations_collection.update_one(
                {"_id": ObjectId(conversation_id)},
                {
                    "$push": {"messages": {"$each": [user_message, ai_message]}},
                    "$set": {"updated_at": datetime.datetime.utcnow()}
                }
            )
        except Exception as e:
            logger.error(f"Error updating conversation in MongoDB: {e}")
            # Update in-memory fallback
            for conv in conversations_memory:
                if conv.get("id") == conversation_id:
                    conv["messages"].extend([user_message, ai_message])
                    conv["updated_at"] = datetime.datetime.utcnow()
                    break
        
        return jsonify({
            "data": {
                "role": "assistant",
                "content": ai_response,
                "timestamp": timestamp
            }
        }), 200
    
    except Exception as e:
        logger.error(f"Error in send_message: {e}")
        return jsonify({"error": str(e)}), 500

# Load conversation
@interview_bp.route('/api/interviews/conversation/<convo_id>', methods=['GET'])
def load_conversation(convo_id):
    try:
        conversation = None
        
        try:
            # Query MongoDB
            conversation = conversations_collection.find_one({"_id": ObjectId(convo_id)})
        except Exception as e:
            logger.error(f"Error retrieving conversation from MongoDB: {e}")
            # Use in-memory fallback
            for conv in conversations_memory:
                if conv.get("id") == convo_id:
                    conversation = conv
                    break
        
        if not conversation:
            return jsonify({"error": "Conversation not found"}), 404
        
        return jsonify({
            "data": {
                "messages": conversation.get("messages", [])
            }
        }), 200
    
    except Exception as e:
        logger.error(f"Error in load_conversation: {e}")
        return jsonify({"error": str(e)}), 500

# Create new conversation
@interview_bp.route('/api/interviews/conversation/new', methods=['POST'])
def create_conversation():
    try:
        data = request.json
        user_id = data.get('userId')
        
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        # Create a new conversation
        conversation_id = str(ObjectId())
        created_at = datetime.datetime.utcnow()
        
        new_conversation = {
            "_id": ObjectId(conversation_id),
            "id": conversation_id,
            "user_id": user_id,
            "title": "Interview Preparation",
            "created_at": created_at,
            "updated_at": created_at,
            "active": True,
            "messages": []
        }
        
        try:
            conversations_collection.insert_one(new_conversation)
        except Exception as e:
            logger.error(f"Error inserting into MongoDB: {e}")
            # Use in-memory fallback
            new_conversation["_id"] = conversation_id
            conversations_memory.append(new_conversation)
        
        return jsonify({
            "data": {
                "conversationId": conversation_id
            }
        }), 201
    
    except Exception as e:
        logger.error(f"Error in create_conversation: {e}")
        return jsonify({"error": str(e)}), 500

# Get category questions
@interview_bp.route('/api/interviews/category-questions/<category_id>', methods=['GET'])
def get_category_questions(category_id):
    try:
        category_name = None
        
        # Get category name from ID
        try:
            category = topics_collection.find_one({"id": category_id})
            if category:
                category_name = category.get("name")
        except Exception as e:
            logger.error(f"Error finding category in MongoDB: {e}")
            # Use in-memory fallback
            for topic in topics_memory:
                if topic.get("id") == category_id:
                    category_name = topic.get("name")
                    break
        
        if not category_name:
            return jsonify({"error": "Category not found"}), 404
        
        # Get questions for category
        questions = []
        
        try:
            # Query MongoDB
            cursor = questions_collection.find({"category": category_name})
            for doc in cursor:
                questions.append(doc.get("question"))
        except Exception as e:
            logger.error(f"Error querying questions from MongoDB: {e}")
            # Use default questions as fallback
            questions = [
                "Tell me about a time you had to resolve a conflict in your team.",
                "How do you handle tight deadlines and pressure?",
                "Describe a situation where you failed and how you handled it.",
                "What's your approach to working with difficult team members?"
            ]
        
        return jsonify({"data": questions}), 200
    
    except Exception as e:
        logger.error(f"Error in get_category_questions: {e}")
        return jsonify({"error": str(e)}), 500

# Create mock interview
@interview_bp.route('/api/interviews/mock-interview', methods=['POST'])
def create_mock_interview():
    try:
        data = request.json
        user_id = data.get('userId')
        job_title = data.get('jobTitle')
        question_count = data.get('questionCount', 5)
        difficulty = data.get('difficultyLevel', 'medium')
        includes_behavioral = data.get('includesBehavioral', True)
        includes_technical = data.get('includesTechnical', True)
        
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        # Generate questions based on parameters
        questions = []
        
        # Use OpenAI to generate relevant questions if available
        if openai_api_key:
            try:
                prompt = f"Generate {question_count} interview questions for a {job_title} position. "
                if includes_behavioral and includes_technical:
                    prompt += "Include both behavioral and technical questions. "
                elif includes_behavioral:
                    prompt += "Focus on behavioral questions. "
                elif includes_technical:
                    prompt += "Focus on technical questions. "
                
                prompt += f"The difficulty level should be {difficulty}."
                
                response = openai.Completion.create(
                    model="text-davinci-003",
                    prompt=prompt,
                    max_tokens=500,
                    temperature=0.7
                )
                
                # Parse response
                generated_text = response.choices[0].text.strip()
                # Split by numbers (1., 2., etc.) or new lines
                import re
                question_candidates = re.split(r'\n\d+[\)\.] |\n\n', generated_text)
                questions = [q.strip() for q in question_candidates if q.strip()]
                
                # Ensure we have the right number of questions
                if len(questions) > question_count:
                    questions = questions[:question_count]
                
            except Exception as e:
                logger.error(f"Error generating questions with OpenAI: {e}")
                # Fall back to default questions
        
        # If OpenAI failed or is not available, use default questions
        if not questions:
            default_questions = {
                "behavioral": [
                    "Tell me about yourself and your background.",
                    "Why are you interested in this role?",
                    "What are your greatest strengths and weaknesses?",
                    "Tell me about a challenging situation you faced at work.",
                    "Where do you see yourself in 5 years?",
                    "Describe a time you had to work with a difficult colleague.",
                    "Tell me about a project you're particularly proud of."
                ],
                "technical": [
                    "What programming languages are you proficient in?",
                    "Describe your experience with database systems.",
                    "How do you approach debugging a complex issue?",
                    "Explain your understanding of object-oriented programming.",
                    "How do you ensure your code is maintainable and scalable?",
                    "Tell me about your experience with agile development methodologies.",
                    "What steps do you take to ensure code quality?"
                ]
            }
            
            # Select questions based on parameters
            selected_questions = []
            
            if includes_behavioral:
                selected_questions.extend(default_questions["behavioral"])
            
            if includes_technical:
                selected_questions.extend(default_questions["technical"])
            
            # Randomize and select the required number
            import random
            random.shuffle(selected_questions)
            questions = selected_questions[:question_count]
        
        # Generate a mock interview ID
        mock_interview_id = str(uuid.uuid4())
        
        return jsonify({
            "data": {
                "mockInterviewId": mock_interview_id,
                "questions": questions
            }
        }), 201
    
    except Exception as e:
        logger.error(f"Error in create_mock_interview: {e}")
        return jsonify({"error": str(e)}), 500

# Setup mock interview
@interview_bp.route('/api/interviews/mock-interview-setup', methods=['POST'])
def create_mock_interview_setup():
    try:
        # In a real app, you would store the setup data in the database
        return jsonify({
            "data": {
                "success": True
            }
        }), 200
    
    except Exception as e:
        logger.error(f"Error in create_mock_interview_setup: {e}")
        return jsonify({"error": str(e)}), 500

# Get premium feedback
@interview_bp.route('/api/interviews/premium-feedback', methods=['POST'])
def get_premium_feedback():
    try:
        data = request.json
        user_input = data.get('userInput')
        
        if not user_input:
            return jsonify({"error": "User input is required"}), 400
        
        feedback = {}
        
        # Use OpenAI for premium feedback if available
        if openai_api_key:
            try:
                prompt = f"""Analyze the following interview response and provide detailed feedback in JSON format with these fields:
                - starRating (1-5): Rating of how well the response follows the STAR method
                - confidenceScore (1-10): Assessment of confidence level in the response
                - softSkills: Analysis of communication style, clarity, and professionalism
                - starPattern: Feedback on structure regarding Situation, Task, Action, Result format
                - suggestions: Specific improvements for the response
                
                Response to analyze: "{user_input}"
                
                Output format should be valid JSON with these exact field names.
                """
                
                response = openai.Completion.create(
                    model="text-davinci-003",
                    prompt=prompt,
                    max_tokens=500,
                    temperature=0.7
                )
                
                # Parse response as JSON
                try:
                    # Clean up the response to ensure it's valid JSON
                    response_text = response.choices[0].text.strip()
                    # Remove any non-JSON text before or after
                    if response_text.find('{') >= 0 and response_text.rfind('}') >= 0:
                        start = response_text.find('{')
                        end = response_text.rfind('}') + 1
                        json_text = response_text[start:end]
                        feedback = json.loads(json_text)
                    else:
                        raise ValueError("Response doesn't contain valid JSON")
                    
                except json.JSONDecodeError:
                    logger.error(f"Error parsing JSON from OpenAI response: {response_text}")
                    # Provide fallback feedback
                    feedback = {
                        "starRating": 3,
                        "confidenceScore": 6,
                        "softSkills": "Your communication style is clear but could be more assertive.",
                        "starPattern": "Your answer includes some STAR elements but could be more structured.",
                        "suggestions": "Be more specific about your actions and the results you achieved."
                    }
            
            except Exception as e:
                logger.error(f"Error getting premium feedback from OpenAI: {e}")
                # Fall back to generated feedback
        
        # If OpenAI failed or is not available, generate feedback
        if not feedback:
            # Simple analysis for fallback
            word_count = len(user_input.split())
            has_situation = any(w in user_input.lower() for w in ["situation", "context", "background"])
            has_task = any(w in user_input.lower() for w in ["task", "goal", "objective", "needed to"])
            has_action = any(w in user_input.lower() for w in ["action", "did", "implemented", "created", "developed"])
            has_result = any(w in user_input.lower() for w in ["result", "outcome", "impact", "achieved", "improved"])
            
            star_elements = sum([has_situation, has_task, has_action, has_result])
            star_rating = min(5, max(1, star_elements + 1))
            
            # Confidence markers
            confident_phrases = ["confident", "certain", "sure", "definitely", "always", "successfully"]
            uncertain_phrases = ["maybe", "perhaps", "might", "i think", "try", "hopefully", "kind of", "sort of"]
            
            confident_count = sum(1 for phrase in confident_phrases if phrase in user_input.lower())
            uncertain_count = sum(1 for phrase in uncertain_phrases if phrase in user_input.lower())
            
            confidence_score = min(10, max(1, 5 + confident_count - uncertain_count))
            
            feedback = {
                "starRating": star_rating,
                "confidenceScore": confidence_score,
                "softSkills": "Your communication style is clear and professional. Consider using more assertive language to convey authority." if confidence_score > 5 else "Your language seems tentative. Try to use more confident phrasing to demonstrate expertise.",
                "starPattern": f"Your answer includes {star_elements}/4 STAR elements. " + ("Great job structuring your response!" if star_rating >= 4 else "Try to clearly address each part of the STAR format: Situation, Task, Action, and Result."),
                "suggestions": "Be more specific about measurable results. Replace phrases like 'I think' with more confident statements like 'I demonstrated' or 'I achieved'."
            }
        
        # Store feedback in database (optional)
        try:
            feedback_doc = {
                "user_id": data.get('userId'),
                "input": user_input,
                "feedback": feedback,
                "timestamp": datetime.datetime.utcnow()
            }
            
            feedback_collection.insert_one(feedback_doc)
        except Exception as e:
            logger.error(f"Error saving feedback to MongoDB: {e}")
            # Use in-memory fallback
            feedback_memory.append({
                "user_id": data.get('userId'),
                "input": user_input,
                "feedback": feedback,
                "timestamp": datetime.datetime.utcnow().isoformat()
            })
        
        return jsonify({"data": feedback}), 200
    
    except Exception as e:
        logger.error(f"Error in get_premium_feedback: {e}")
        return jsonify({"error": str(e)}), 500

# Save feedback to dashboard
@interview_bp.route('/api/interviews/save-feedback', methods=['POST'])
def save_feedback_to_dashboard():
    try:
        data = request.json
        
        try:
            # Store in MongoDB
            feedback_collection.insert_one({
                "user_id": data.get('userId'),
                "conversation_id": data.get('conversationId'),
                "user_input": data.get('userInput'),
                "feedback_data": data.get('feedbackData'),
                "timestamp": datetime.datetime.utcnow()
            })
        except Exception as e:
            logger.error(f"Error saving feedback to MongoDB: {e}")
            # Use in-memory fallback
            feedback_memory.append({
                "user_id": data.get('userId'),
                "conversation_id": data.get('conversationId'),
                "user_input": data.get('userInput'),
                "feedback_data": data.get('feedbackData'),
                "timestamp": datetime.datetime.utcnow().isoformat()
            })
        
        return jsonify({
            "data": {
                "success": True
            }
        }), 200
    
    except Exception as e:
        logger.error(f"Error in save_feedback_to_dashboard: {e}")
        return jsonify({"error": str(e)}), 500 