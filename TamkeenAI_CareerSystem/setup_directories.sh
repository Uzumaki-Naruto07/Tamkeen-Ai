#!/bin/bash

# Create main directories
mkdir -p backend
mkdir -p api/routes

# Create __init__.py files for Python packages
touch api/__init__.py
touch api/routes/__init__.py

# Create skeleton route files
route_modules=(
    "ats_routes"
    "resume_routes"
    "assessment_routes"
    "guidance_routes"
    "emotion_detection_routes"
    "speech_routes"
    "user_routes"
    "auth"
    "career_routes"
    "dataset_routes"
    "analytics_routes"
    "job_routes"
    "job_application_routes"
    "language_model_routes"
)

for module in "${route_modules[@]}"; do
    if [ ! -f "api/routes/${module}.py" ]; then
        echo "Creating api/routes/${module}.py"
        cat > "api/routes/${module}.py" << EOFILE
from flask import Blueprint, jsonify, request

bp = Blueprint('${module}', __name__)

@bp.route('/', methods=['GET'])
def index():
    return jsonify({"message": "${module} API endpoint"})
EOFILE
    fi
done

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install flask flask-cors python-dotenv
    echo "Virtual environment created and basic packages installed."
fi

# Ensure run_app.sh is executable
chmod +x run_app.sh

echo "✅ Directory structure created successfully!"
echo "You can now run the application with ./run_app.sh"
