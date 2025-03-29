"""
Database connector for TamkeenAI.

This module provides connections to the database (MongoDB in this case).
"""

import os
import logging
from typing import Dict, List, Optional, Union, Any
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# MongoDB connection details
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "tamkeen")
USE_MOCK_DB = os.getenv('USE_MOCK_DB', 'false').lower() == 'true'

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
    # Connect to MongoDB with timeout
    logger.info(f"Connecting to MongoDB at {MONGO_URI}...")
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Verify connection
    mongo_client.admin.command('ping')
    db = mongo_client[MONGO_DB]
    logger.info(f"Successfully connected to MongoDB at {MONGO_URI}")
except (ConnectionFailure, ServerSelectionTimeoutError) as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
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
    # Try to connect to MongoDB
    try:
        # Try to import pymongo
        import pymongo
        from pymongo import MongoClient
        
        # Create MongoDB client (with a longer timeout for development)
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=20000, connectTimeoutMS=20000)
        
        # Verify connection
        client.server_info()  # Will raise an exception if connection fails
        
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
        
        logger.info(f"Connected to MongoDB: {MONGO_DB}")
        
    except (ImportError, pymongo.errors.ServerSelectionTimeoutError, pymongo.errors.ConnectionFailure) as e:
        logger.warning(f"MongoDB connection failed: {str(e)}. Using mock database.")
        print(f"MongoDB connection failed: {str(e)}. Using mock database.")
        
        # Create mock collections
        (
            user_collection, resume_collection, job_collection,
            application_collection, skill_collection, activity_collection
        ) = create_mock_collections()

    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {str(e)}")
        print(f"Error connecting to MongoDB: {str(e)}. Using mock database.")
        
        # Create mock collections when connection fails
        (
            user_collection, resume_collection, job_collection,
            application_collection, skill_collection, activity_collection
        ) = create_mock_collections() 