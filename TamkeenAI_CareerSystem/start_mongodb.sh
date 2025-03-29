#!/bin/bash

# Check if MongoDB is running
if pgrep -x "mongod" > /dev/null
then
    echo "MongoDB is already running"
else
    echo "MongoDB is not running. Starting MongoDB..."
    
    # Check if MongoDB is installed
    if command -v mongod &> /dev/null
    then
        # Try to start MongoDB
        if [ -x "$(command -v brew)" ]; then
            # MacOS with Homebrew
            brew services start mongodb-community || brew services start mongodb
        else
            # Try direct start
            mongod --dbpath ~/data/db --fork --logpath ~/data/mongodb.log
        fi
        
        echo "Waiting for MongoDB to start..."
        sleep 3
        
        # Check if it started successfully
        if pgrep -x "mongod" > /dev/null
        then
            echo "MongoDB started successfully"
        else
            echo "Failed to start MongoDB. Using mock database."
        fi
    else
        echo "MongoDB is not installed. Please install MongoDB or the application will use mock data."
    fi
fi 