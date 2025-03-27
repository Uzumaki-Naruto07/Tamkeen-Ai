#!/bin/bash

echo "===== Starting TamkeenAI Frontend ====="

# Navigate to frontend directory
cd "$(dirname "$0")/frontend" || { echo "Failed to change to frontend directory"; exit 1; }

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not found"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is required but not found"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install || { echo "Failed to install dependencies"; exit 1; }
else
    echo "Dependencies already installed"
fi

# Start the development server
echo "Starting frontend development server..."
npm run dev

echo "Frontend server stopped" 