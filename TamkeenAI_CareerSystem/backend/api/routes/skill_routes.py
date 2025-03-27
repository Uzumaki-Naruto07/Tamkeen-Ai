from flask import Blueprint, request, jsonify
import logging
from api.middleware.auth_middleware import token_required

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
skill_bp = Blueprint('skill', __name__)

@skill_bp.route('/skill/hello', methods=['GET'])
def hello():
    """Test endpoint"""
    return jsonify({"message": "Hello from skill API!"}), 200

@skill_bp.route('/skill/protected', methods=['GET'])
@token_required
def protected(current_user):
    """Protected test endpoint"""
    return jsonify({"message": "This is a protected endpoint", "user": current_user}), 200
