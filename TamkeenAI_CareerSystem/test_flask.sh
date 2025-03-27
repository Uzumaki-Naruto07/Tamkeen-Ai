#!/bin/bash

echo "Testing minimal Flask installation..."

# Create a fresh virtual environment
rm -rf test_venv 2>/dev/null
python3 -m venv test_venv
source test_venv/bin/activate

# Install only Flask
pip install flask==2.2.3

# Run the minimal Flask application
python minimal_flask.py 