#!/usr/bin/env python3
"""
MongoDB Atlas Connection Test Script for TamkeenAI Career System

This script tests the connection to MongoDB Atlas using the credentials
stored in the environment variables or .env file.
"""

import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi

def test_mongodb_connection():
    """Test connection to MongoDB Atlas."""
    # Load environment variables from .env file
    load_dotenv()
    
    # Get MongoDB URI from environment variables
    mongo_uri = os.getenv("MONGO_URI", "mongodb+srv://loveanime200o0:R8tdEvgOvId5FEZv@tamkeen.0fmhury.mongodb.net/?retryWrites=true&w=majority&appName=Tamkeen")
    
    if not mongo_uri:
        print("Error: MONGO_URI environment variable not set.")
        sys.exit(1)
    
    try:
        # Connect to MongoDB Atlas with Server API version
        print(f"Connecting to MongoDB Atlas...")
        client = MongoClient(mongo_uri, server_api=ServerApi('1'))
        
        # Verify connection with a ping command
        client.admin.command('ping')
        
        # Check database info
        db_names = client.list_database_names()
        print(f"Successfully connected to MongoDB Atlas!")
        print(f"Available databases: {', '.join(db_names)}")
        
        # Print cluster information
        print("\nCluster Information:")
        server_status = client.admin.command('serverStatus')
        print(f"- MongoDB Version: {server_status.get('version', 'Unknown')}")
        print(f"- Connection: {server_status.get('connections', {}).get('current', 'Unknown')} current, {server_status.get('connections', {}).get('available', 'Unknown')} available")
        
        # Check tamkeen database and collections
        tamkeen_db = client.get_database("tamkeen")
        collection_names = tamkeen_db.list_collection_names()
        
        if collection_names:
            print(f"\nCollections in 'tamkeen' database: {', '.join(collection_names)}")
            
            # Count documents in each collection
            print("\nCollection statistics:")
            for collection_name in collection_names:
                count = tamkeen_db[collection_name].count_documents({})
                print(f"- {collection_name}: {count} documents")
        else:
            print("\nThe 'tamkeen' database exists but has no collections yet.")
            
        return True
        
    except Exception as e:
        print(f"Error connecting to MongoDB Atlas: {str(e)}")
        return False

if __name__ == "__main__":
    if test_mongodb_connection():
        print("\nMongoDB Atlas connection test passed successfully! Your application is ready to use MongoDB Atlas.")
    else:
        print("\nMongoDB Atlas connection test failed. Please check your connection string and network settings.") 