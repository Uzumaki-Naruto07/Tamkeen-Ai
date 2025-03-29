import sys
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

try:
    # Connect to the MongoDB server
    client = MongoClient('mongodb://localhost:27017', serverSelectionTimeoutMS=5000)
    
    # Force a connection by issuing a server command
    client.admin.command('ping')
    
    # If we get here, the server is running
    print("MongoDB connection successful!")
    print("Server info:", client.server_info())
    
    # List all databases
    print("\nAvailable databases:")
    for db in client.list_databases():
        print(f"- {db['name']}")
    
    sys.exit(0)
except ConnectionFailure as e:
    print(f"Failed to connect to MongoDB: {e}")
    sys.exit(1) 