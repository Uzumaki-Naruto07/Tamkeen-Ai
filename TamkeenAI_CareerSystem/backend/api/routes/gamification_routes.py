from flask import Blueprint, request, jsonify
import logging
from api.middleware.auth_middleware import token_required

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
gamification_bp = Blueprint('gamification', __name__)

@gamification_bp.route('/gamification/hello', methods=['GET'])
def hello():
    """Test endpoint"""
    return jsonify({"message": "Hello from gamification API!"}), 200

@gamification_bp.route('/gamification/protected', methods=['GET'])
@token_required
def protected(current_user):
    """Protected test endpoint"""
    return jsonify({"message": "This is a protected endpoint", "user": current_user}), 200
