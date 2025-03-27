from flask import Blueprint, request, jsonify
import logging
from api.middleware.auth_middleware import token_required

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
interview_bp = Blueprint('interview', __name__)

@interview_bp.route('/interview/hello', methods=['GET'])
def hello():
    """Test endpoint"""
    return jsonify({"message": "Hello from interview API!"}), 200

@interview_bp.route('/interview/protected', methods=['GET'])
@token_required
def protected(current_user):
    """Protected test endpoint"""
    return jsonify({"message": "This is a protected endpoint", "user": current_user}), 200
