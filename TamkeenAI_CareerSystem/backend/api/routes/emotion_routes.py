from flask import Blueprint, request, jsonify
import logging
from api.middleware.auth_middleware import token_required

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
emotion_bp = Blueprint('emotion', __name__)

@emotion_bp.route('/emotion/hello', methods=['GET'])
def hello():
    """Test endpoint"""
    return jsonify({"message": "Hello from emotion API!"}), 200

@emotion_bp.route('/emotion/protected', methods=['GET'])
@token_required
def protected(current_user):
    """Protected test endpoint"""
    return jsonify({"message": "This is a protected endpoint", "user": current_user}), 200
