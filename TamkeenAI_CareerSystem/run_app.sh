#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ -f .env ]; then
    echo "Loading environment variables from .env file"
    export $(grep -v '^#' .env | xargs)
else
    echo "Creating .env file with default settings..."
    cp .env.example .env
    export $(grep -v '^#' .env | xargs)
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "Virtual environment created."
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install core dependencies (without AI packages)
echo "Installing core dependencies..."
pip install -r backend/requirements.txt

# Ask if AI packages should be installed
if [ "$1" == "--with-ai" ]; then
    echo "Installing AI packages (this may take some time)..."
    pip install transformers>=4.25.1 scikit-learn>=1.2.1 pandas>=1.5.3 numpy>=1.24.2
    
    # Ask about PyTorch/TensorFlow
    read -p "Install PyTorch? (y/n) " install_torch
    if [[ $install_torch == "y" ]]; then
        echo "Installing PyTorch (CPU version)..."
        pip install torch==2.0.1 torchvision==0.15.2 --index-url https://download.pytorch.org/whl/cpu
    fi
    
    read -p "Install TensorFlow? (y/n) " install_tf
    if [[ $install_tf == "y" ]]; then
        echo "Installing TensorFlow..."
        pip install tensorflow>=2.11.0
    fi
    
    read -p "Install spaCy? (y/n) " install_spacy
    if [[ $install_spacy == "y" ]]; then
        echo "Installing spaCy and English model..."
        pip install spacy>=3.5.0
        python -m spacy download en_core_web_sm
    fi
else
    echo "Skipping AI packages. Use './run_app.sh --with-ai' to install them."
fi

# Create necessary directories
mkdir -p backend/logs
mkdir -p backend/tmp

# Initialize SQLite database for development
if [[ $DATABASE_URL == sqlite* ]]; then
    echo "Initializing SQLite database..."
    touch ${DATABASE_URL#sqlite:///}
fi

# Start the application
echo "Starting Tamkeen AI backend server..."
cd backend
python app.py

# Deactivate virtual environment on exit
trap "echo 'Deactivating virtual environment...'; deactivate" EXIT
