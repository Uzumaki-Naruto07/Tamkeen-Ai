#!/bin/bash

# Stop on first error
set -e

echo "===== Starting Tamkeen AI Career System ====="

# Create necessary directories if they don't exist
mkdir -p backend/logs
mkdir -p backend/tmp

# Ensure we're in the project root directory
cd "$(dirname "$0")" || { echo "Failed to change to script directory"; exit 1; }

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not found"
    echo "Please install Python 3 and try again"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "Creating .env file from example template..."
        cp .env.example .env
    else
        echo "Creating basic .env file..."
        cat > .env << EOF
FLASK_APP=backend/app.py
FLASK_ENV=development
FLASK_DEBUG=1
PORT=5000
SECRET_KEY=dev-secret-key
JWT_SECRET_KEY=dev-jwt-secret-key
DATABASE_URL=sqlite:///backend/tamkeen.db
EOF
    fi
fi

# Source environment variables
echo "Loading environment variables..."
export $(grep -v '^#' .env | xargs) || echo "Warning: Some variables may not be set properly"

# Setup virtual environment (more reliably)
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv || { echo "Failed to create virtual environment"; exit 1; }
fi

# Activate virtual environment with proper error handling
echo "Activating virtual environment..."
source venv/bin/activate || { echo "Failed to activate virtual environment"; exit 1; }

# Verify the virtual environment is active
if [ -z "$VIRTUAL_ENV" ]; then
    echo "Error: Virtual environment not activated properly"
    echo "Try running 'python3 -m venv venv' and 'source venv/bin/activate' manually"
    exit 1
fi

# Upgrade pip
echo "Upgrading pip..."
python -m pip install --upgrade pip

# Install only essential requirements
echo "Installing minimal dependencies..."
cat > backend/minimal-requirements.txt << EOF
Flask==2.2.3
flask-cors==3.0.10
python-dotenv==1.0.0
werkzeug==2.2.3
pyjwt==2.6.0
EOF

# Install minimal requirements
pip install -r backend/minimal-requirements.txt || { echo "Failed to install minimal requirements"; exit 1; }

# Create SQLite database file if using SQLite
DB_PATH=${DATABASE_URL#sqlite:///}
if [[ $DATABASE_URL == sqlite* ]]; then
    echo "Ensuring SQLite database exists at: $DB_PATH"
    touch "$DB_PATH" || { echo "Failed to create database file"; exit 1; }
fi

# Run the setup script to create all route files
echo "Setting up route files..."
cd backend
python setup_routes.py
cd ..

# Start the application with better error handling
echo "Starting Tamkeen AI backend server..."
echo "======================================"
cd backend || { echo "Failed to change to backend directory"; exit 1; }
echo "Setting up Python path..."
python fix_path.py
python app.py || { echo "Failed to start the application"; exit 1; }

# This will only execute if the application is stopped normally
deactivate
echo "Application stopped"
