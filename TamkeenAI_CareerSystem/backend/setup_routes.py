#!/usr/bin/env python3

import os

# List of all route modules mentioned in app.py
route_modules = [
    "auth_routes",
    "resume_routes",    # We already created this one
    "career_routes",
    "interview_routes",
    "job_routes",
    "analytics_routes",
    "admin_routes",
    "user_routes",
    "assessment_routes",
    "feedback_routes",
    "gamification_routes",
    "ai_journey_routes",
    "learning_routes",
    "skill_routes",
    "notification_routes",
    "settings_routes",
    "emotion_routes",
    "pdf_routes",
    "search_routes",
    "chat_routes"
]

# Template for a basic route file - with double curly braces to escape them
route_template = """from flask import Blueprint, request, jsonify
import logging
from api.middleware.auth_middleware import token_required

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
{bp_name}_bp = Blueprint('{bp_base}', __name__)

@{bp_name}_bp.route('/{bp_base}/hello', methods=['GET'])
def hello():
    \"\"\"Test endpoint\"\"\"
    return jsonify({{"message": "Hello from {bp_base} API!"}}), 200

@{bp_name}_bp.route('/{bp_base}/protected', methods=['GET'])
@token_required
def protected(current_user):
    \"\"\"Protected test endpoint\"\"\"
    return jsonify({{"message": "This is a protected endpoint", "user": current_user}}), 200
"""

# Ensure directories exist
os.makedirs("api/routes", exist_ok=True)
os.makedirs("api/services", exist_ok=True)
os.makedirs("api/middleware", exist_ok=True)
os.makedirs("api/models", exist_ok=True)

# Create __init__.py files
for dir_path in ["api", "api/routes", "api/services", "api/middleware", "api/models"]:
    init_path = f"{dir_path}/__init__.py"
    if not os.path.exists(init_path):
        with open(init_path, "w") as f:
            f.write("# This file makes the directory a Python package\n")
        print(f"Created {init_path}")

# Create route files
for module in route_modules:
    # Skip resume_routes since we've already created it
    if module == "resume_routes":
        continue
        
    # Extract the base name (e.g., "auth" from "auth_routes")
    bp_base = module.replace("_routes", "")
    
    # Set bp_name (e.g., "auth" from "auth_routes")
    bp_name = bp_base
    
    file_path = f"api/routes/{module}.py"
    
    # Only create if it doesn't exist
    if not os.path.exists(file_path):
        with open(file_path, "w") as f:
            f.write(route_template.format(bp_name=bp_name, bp_base=bp_base))
        print(f"Created {file_path}")
    else:
        print(f"Skipped existing {file_path}")

print("\nSetup complete! All route files have been created.")
print("You can now run the application with: python app.py") 