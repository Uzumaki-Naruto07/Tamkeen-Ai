#!/bin/bash
# Run the simple interview API server on port 5001

# Change to the backend directory
cd "$(dirname "$0")/backend"

# Check if Python virtual environment exists
if [ -d "../venv" ]; then
    echo "Activating virtual environment..."
    source ../venv/bin/activate
elif [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

echo "Starting Simple Interview API server on port 5001..."
# Kill any existing processes using port 5001
lsof -ti:5001 | xargs kill -9 2>/dev/null || echo "No process running on port 5001"

# Start the simple API without debug mode or auto-reloading
python simple_interview_api.py 