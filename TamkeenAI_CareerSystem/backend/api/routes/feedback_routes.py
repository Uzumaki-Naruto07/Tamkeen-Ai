from flask import Blueprint, request, jsonify
import logging
from api.middleware.auth_middleware import token_required

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
feedback_bp = Blueprint('feedback', __name__)

@feedback_bp.route('/feedback/hello', methods=['GET'])
def hello():
    """Test endpoint"""
    return jsonify({"message": "Hello from feedback API!"}), 200

@feedback_bp.route('/feedback/protected', methods=['GET'])
@token_required
def protected(current_user):
    """Protected test endpoint"""
    return jsonify({"message": "This is a protected endpoint", "user": current_user}), 200
