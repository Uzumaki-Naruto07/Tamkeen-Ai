#!/bin/bash

# Exit on error
set -e

echo "===== Starting Minimal TamkeenAI Career System ====="

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not found"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not found"
    exit 1
fi

# Install Flask and CORS if needed
pip install flask flask-cors

# Start backend in background
echo "Starting minimal backend..."
python3 minimal_backend.py &
BACKEND_PID=$!

# Create minimal frontend if not exists
if [ ! -d "minimal_frontend" ]; then
    echo "Creating minimal frontend with Vite..."
    npm create vite@latest minimal_frontend -- --template react
    cd minimal_frontend
    npm install
    cd ..
fi

# Copy App.jsx and App.css
cp -f ./App.jsx ./minimal_frontend/src/App.jsx
cp -f ./App.css ./minimal_frontend/src/App.css

# Start frontend
echo "Starting minimal frontend..."
cd minimal_frontend
npm run dev

# Kill backend when script is terminated
trap "echo 'Stopping backend...'; kill $BACKEND_PID" EXIT 