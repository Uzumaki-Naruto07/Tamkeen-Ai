#!/bin/bash

echo "Running simplified diagnostic server..."

# Check for Python3
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required"
    exit 1
fi

# Create and activate virtual environment
if [ ! -d "simple_venv" ]; then
    echo "Creating new virtual environment..."
    python3 -m venv simple_venv
fi

# Activate
echo "Activating virtual environment..."
source simple_venv/bin/activate

# Install minimal dependencies
echo "Installing only Flask and flask-cors..."
pip install flask flask-cors

# Run the simplified diagnostic
echo "Starting diagnostic server..."
python simple_diagnostic.py

# Clean up when done
deactivate 