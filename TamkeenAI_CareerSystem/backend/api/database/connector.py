"""
Database connector for TamkeenAI.

This module provides connections to the database (MongoDB in this case).
"""

import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logger
logger = logging.getLogger(__name__)

# MongoDB connection parameters
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
MONGO_DB = os.getenv('MONGO_DB', 'tamkeen_db')
USE_MOCK_DB = os.getenv('USE_MOCK_DB', 'false').lower() == 'true'

# Create mock collections class
class MockCollection:
    def __init__(self, name):
        self.name = name
        self.data = []
        self.indexes = []
    
    def create_index(self, keys, **kwargs):
        if isinstance(keys, list):
            index_name = '_'.join([k[0] for k in keys])
        else:
            index_name = keys
        self.indexes.append(index_name)
        return index_name
    
    def insert_one(self, document):
        self.data.append(document)
        return type('obj', (object,), {'inserted_id': id(document)})
    
    def find(self, query=None, projection=None):
        # Simple mock find
        return self.data
    
    def find_one(self, query):
        # Simple mock find_one
        for doc in self.data:
            match = True
            for k, v in query.items():
                if k not in doc or doc[k] != v:
                    match = False
                    break
            if match:
                return doc
        return None
    
    def update_one(self, query, update, **kwargs):
        # Simple mock update_one
        for doc in self.data:
            match = True
            for k, v in query.items():
                if k not in doc or doc[k] != v:
                    match = False
                    break
            if match:
                for k, v in update.get('$set', {}).items():
                    doc[k] = v
                return type('obj', (object,), {'modified_count': 1})
        return type('obj', (object,), {'modified_count': 0})
    
    def delete_one(self, query):
        # Simple mock delete_one
        for i, doc in enumerate(self.data):
            match = True
            for k, v in query.items():
                if k not in doc or doc[k] != v:
                    match = False
                    break
            if match:
                self.data.pop(i)
                return type('obj', (object,), {'deleted_count': 1})
        return type('obj', (object,), {'deleted_count': 0})

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