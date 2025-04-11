"""
Initialize MongoDB collections for the Interview Coach system

This script sets up the initial database structure for the Interview Coach,
including sample topics and questions.
"""

import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId
import logging
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def sanitize_mongo_uri(uri):
    """Remove conflicting TLS options from MongoDB URI."""
    try:
        parsed = urlparse(uri)
        query_params = parse_qs(parsed.query)
        
        # If both conflicting options exist, remove tlsAllowInvalidCertificates
        if 'tlsInsecure' in query_params and 'tlsAllowInvalidCertificates' in query_params:
            del query_params['tlsAllowInvalidCertificates']
            logger.info("Removed conflicting TLS option: tlsAllowInvalidCertificates")
        
        # Rebuild query string
        new_query = urlencode(query_params, doseq=True)
        new_parts = list(parsed)
        new_parts[4] = new_query  # Replace query component
        
        return urlunparse(tuple(new_parts))
    except Exception as e:
        logger.warning(f"Error sanitizing MongoDB URI: {e}. Using original URI.")
        return uri

def init_db():
    """Initialize MongoDB collections for the Interview Coach"""
    try:
        # Connect to MongoDB
        mongo_uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/')
        # Sanitize URI to avoid conflicting TLS options
        mongo_uri = sanitize_mongo_uri(mongo_uri)
        client = MongoClient(mongo_uri)
        db = client['tamkeen_ai']
        
        # Create or access collections
        conversations = db['interview_conversations']
        topics = db['interview_topics'] 
        questions = db['interview_questions']
        feedback = db['interview_feedback']
        
        # Create indexes
        conversations.create_index([("user_id", 1)])
        conversations.create_index([("created_at", -1)])
        feedback.create_index([("user_id", 1)])
        
        # Initialize topics if collection is empty
        if topics.count_documents({}) == 0:
            logger.info("Initializing interview topics collection...")
            default_topics = [
                {"id": str(ObjectId()), "name": "Behavioral Questions", "count": 28},
                {"id": str(ObjectId()), "name": "Technical Skills", "count": 42},
                {"id": str(ObjectId()), "name": "Situational Scenarios", "count": 15},
                {"id": str(ObjectId()), "name": "Communication", "count": 19},
                {"id": str(ObjectId()), "name": "Leadership & Teamwork", "count": 23}
            ]
            topics.insert_many(default_topics)
            logger.info(f"Added {len(default_topics)} default topics")
        
        # Initialize questions if collection is empty
        if questions.count_documents({}) == 0:
            logger.info("Initializing interview questions collection...")
            default_questions = [
                {"question": "What are the most common interview questions for software engineers?", "category": "Technical Skills"},
                {"question": "How should I prepare for behavioral interviews?", "category": "Behavioral Questions"},
                {"question": "What's the best way to answer 'Tell me about yourself'?", "category": "Communication"},
                {"question": "How can I improve my communication during interviews?", "category": "Communication"},
                {"question": "What should I do if I don't know an answer?", "category": "Situational Scenarios"},
                {"question": "Describe a situation where you had to work under pressure.", "category": "Behavioral Questions"},
                {"question": "Tell me about a time you had to resolve a conflict in your team.", "category": "Leadership & Teamwork"},
                {"question": "How do you handle tight deadlines and pressure?", "category": "Situational Scenarios"},
                {"question": "Describe a situation where you failed and how you handled it.", "category": "Behavioral Questions"},
                {"question": "What's your approach to working with difficult team members?", "category": "Leadership & Teamwork"},
                {"question": "How do you stay current with technology trends?", "category": "Technical Skills"},
                {"question": "Tell me about a recent project you worked on.", "category": "Technical Skills"},
                {"question": "How do you handle feedback?", "category": "Communication"},
                {"question": "What are your greatest strengths and weaknesses?", "category": "Behavioral Questions"},
                {"question": "How do you approach solving complex problems?", "category": "Technical Skills"}
            ]
            questions.insert_many(default_questions)
            logger.info(f"Added {len(default_questions)} default questions")
        
        logger.info("MongoDB collections initialized successfully")
        return True
    
    except Exception as e:
        logger.error(f"Error initializing MongoDB: {e}")
        return False

if __name__ == "__main__":
    successful = init_db()
    sys.exit(0 if successful else 1) 