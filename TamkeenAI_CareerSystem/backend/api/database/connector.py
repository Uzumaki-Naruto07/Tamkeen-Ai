"""
Database connector for TamkeenAI.

This module provides connections to the database (MongoDB in this case).
"""

import os
import logging
from typing import Dict, List, Optional, Union, Any
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# MongoDB Atlas connection details
# Ensure we don't have conflicting TLS parameters in the URI
MONGO_URI_DEFAULT = "mongodb+srv://loveanime200o0:R8tdEvgOvId5FEZv@tamkeen.0fmhury.mongodb.net/?retryWrites=true&w=majority&tls=true&appName=Tamkeen"
MONGO_URI_ENV = os.getenv("MONGO_URI", MONGO_URI_DEFAULT)

# Prevent conflicting TLS options in URI
def sanitize_mongo_uri(uri):
    """Remove conflicting TLS options from MongoDB URI."""
    try:
        parsed = urlparse(uri)
        query_params = parse_qs(parsed.query)
        
        # If both conflicting options exist, remove tlsAllowInvalidCertificates
        if 'tlsInsecure' in query_params and 'tlsAllowInvalidCertificates' in query_params:
            del query_params['tlsAllowInvalidCertificates']
        
        # Rebuild query string
        new_query = urlencode(query_params, doseq=True)
        new_parts = list(parsed)
        new_parts[4] = new_query  # Replace query component
        
        return urlunparse(tuple(new_parts))
    except Exception as e:
        logger.warning(f"Error sanitizing MongoDB URI: {e}. Using original URI.")
        return uri

# Apply sanitization to URI
MONGO_URI = sanitize_mongo_uri(MONGO_URI_ENV)
logger.info(f"Using MongoDB URI with sanitized TLS options")

MONGO_DB = os.getenv("MONGO_DB", "tamkeen")
USE_MOCK_DB = os.getenv('USE_MOCK_DB', 'false').lower() == 'true'

# Get SSL/TLS settings from environment
MONGO_TLS = os.getenv('MONGO_TLS', None)
TLS_CERT_PATH = os.getenv('TLS_CERT_PATH', None)
PYMONGO_TLS_INSECURE = os.getenv('PYMONGO_TLS_INSECURE_SKIP_VERIFY', 'false').lower() == 'true'

# Mock collection for testing or when MongoDB is not available
class MockCollection:
    def __init__(self, name):
        self.name = name
        self.data = {}
        self._id = 0

    def insert_one(self, document):
        self._id += 1
        _id = document.get("_id", self._id)
        document["_id"] = _id
        self.data[_id] = document
        return InsertOneResult(_id, True)

    def find_one(self, query=None, *args, **kwargs):
        if query is None:
            query = {}

        if "_id" in query:
            _id = query["_id"]
            return self.data.get(_id)

        for doc in self.data.values():
            match = True
            for key, value in query.items():
                if key not in doc or doc[key] != value:
                    match = False
                    break
            if match:
                return doc
        return None

    def find(self, query=None, *args, **kwargs):
        if query is None:
            query = {}

        result = []
        for doc in self.data.values():
            match = True
            for key, value in query.items():
                if key not in doc or doc[key] != value:
                    match = False
                    break
            if match:
                result.append(doc)
        return MockCursor(result)
    
    def update_one(self, query, update, *args, **kwargs):
        doc = self.find_one(query)
        if doc is not None:
            _id = doc["_id"]
            if "$set" in update:
                for key, value in update["$set"].items():
                    doc[key] = value
            self.data[_id] = doc
            return UpdateResult(True, 1)
        return UpdateResult(True, 0)
    
    def delete_one(self, query):
        doc = self.find_one(query)
        if doc is not None:
            _id = doc["_id"]
            del self.data[_id]
            return DeleteResult(True, 1)
        return DeleteResult(True, 0)

class MockCursor:
    def __init__(self, data):
        self.data = data
        self.current = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.current < len(self.data):
            doc = self.data[self.current]
            self.current += 1
            return doc
        raise StopIteration

class InsertOneResult:
    def __init__(self, inserted_id, acknowledged):
        self.inserted_id = inserted_id
        self.acknowledged = acknowledged

class UpdateResult:
    def __init__(self, acknowledged, modified_count):
        self.acknowledged = acknowledged
        self.modified_count = modified_count

class DeleteResult:
    def __init__(self, acknowledged, deleted_count):
        self.acknowledged = acknowledged
        self.deleted_count = deleted_count

# MongoDB client
mongo_client = None
db = None
collections = {}

try:
    # Connect to MongoDB Atlas with timeout and server API version
    logger.info(f"Connecting to MongoDB Atlas...")
    
    # Configure SSL/TLS options - use a simplified approach with only one option
    ssl_options = {}
    
    try:
        # Only set tlsInsecure, never both options
        if MONGO_TLS == 'CERT_NONE' or PYMONGO_TLS_INSECURE:
            ssl_options['tlsInsecure'] = True
    except Exception as ssl_config_error:
        logger.warning(f"Error setting SSL options: {ssl_config_error}. Proceeding with default SSL settings.")
        ssl_options = {}
        
    # Add SSL options to connection
    mongo_client = MongoClient(
        MONGO_URI, 
        server_api=ServerApi('1'), 
        serverSelectionTimeoutMS=5000,
        **ssl_options
    )
    
    # Verify connection
    mongo_client.admin.command('ping')
    db = mongo_client[MONGO_DB]
    logger.info(f"Successfully connected to MongoDB Atlas")
except (ConnectionFailure, ServerSelectionTimeoutError) as e:
    logger.error(f"Failed to connect to MongoDB Atlas: {e}")
    logger.warning("Using mock database instead")
    db = None

def get_collection(name):
    """Get a collection from MongoDB or create a mock collection if MongoDB is not available."""
    if name in collections:
        return collections[name]
    
    if db is not None:
        collections[name] = db[name]
    else:
        logger.warning(f"Creating mock collection for {name}")
        collections[name] = MockCollection(name)
    
    return collections[name]

# Function to create mock collections
def create_mock_collections():
    logger.info("Using mock database collections")
    print("Using mock database collections")
    user_collection = MockCollection('users')
    resume_collection = MockCollection('resumes')
    job_collection = MockCollection('jobs')
    application_collection = MockCollection('applications')
    skill_collection = MockCollection('skills')
    activity_collection = MockCollection('user_activities')
    return (
        user_collection, resume_collection, job_collection,
        application_collection, skill_collection, activity_collection
    )

# Check if we should use mock DB from environment
if USE_MOCK_DB:
    logger.info("USE_MOCK_DB is set to true. Using mock database.")
    print("USE_MOCK_DB is set to true. Using mock database.")
    (
        user_collection, resume_collection, job_collection,
        application_collection, skill_collection, activity_collection
    ) = create_mock_collections()
else:
    # Try to connect to MongoDB Atlas
    try:
        # Try to import pymongo
        import pymongo
        import ssl
        from pymongo import MongoClient
        from pymongo.server_api import ServerApi
        
        # Configure SSL/TLS options - use a simplified approach with only one option
        ssl_options = {}
        
        try:
            # Only set tlsInsecure, never both options
            if MONGO_TLS == 'CERT_NONE' or PYMONGO_TLS_INSECURE:
                ssl_options['tlsInsecure'] = True
        except Exception as ssl_config_error:
            logger.warning(f"Error setting SSL options: {ssl_config_error}. Proceeding with default SSL settings.")
            ssl_options = {}
        
        # Create MongoDB Atlas client (with a longer timeout for development)
        client = MongoClient(
            MONGO_URI, 
            server_api=ServerApi('1'), 
            serverSelectionTimeoutMS=20000, 
            connectTimeoutMS=20000,
            **ssl_options
        )
        
        # Verify connection
        client.admin.command('ping')  # Will raise an exception if connection fails
        
        db = client[MONGO_DB]
        
        # Get collections
        user_collection = db['users']
        resume_collection = db['resumes']
        job_collection = db['jobs']
        application_collection = db['applications']
        skill_collection = db['skills']
        activity_collection = db['user_activities']
        
        # Create indexes
        user_collection.create_index('email', unique=True)
        resume_collection.create_index('user_id')
        job_collection.create_index('title')
        application_collection.create_index([('user_id', pymongo.ASCENDING), ('job_id', pymongo.ASCENDING)], unique=True)
        skill_collection.create_index('name', unique=True)
        activity_collection.create_index([('user_id', pymongo.ASCENDING), ('timestamp', pymongo.DESCENDING)])
        
        logger.info(f"Connected to MongoDB Atlas: {MONGO_DB}")
        
    except (ImportError, pymongo.errors.ServerSelectionTimeoutError, pymongo.errors.ConnectionFailure) as e:
        logger.warning(f"MongoDB Atlas connection failed: {str(e)}. Using mock database.")
        print(f"MongoDB Atlas connection failed: {str(e)}. Using mock database.")
        
        # Create mock collections
        (
            user_collection, resume_collection, job_collection,
            application_collection, skill_collection, activity_collection
        ) = create_mock_collections()

    except Exception as e:
        logger.error(f"Error connecting to MongoDB Atlas: {str(e)}")
        print(f"Error connecting to MongoDB Atlas: {str(e)}. Using mock database.")
        
        # Create mock collections when connection fails
        (
            user_collection, resume_collection, job_collection,
            application_collection, skill_collection, activity_collection
        ) = create_mock_collections() 