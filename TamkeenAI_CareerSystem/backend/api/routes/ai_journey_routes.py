from flask import Blueprint, request, jsonify
import logging
from api.middleware.auth_middleware import token_required

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
ai_journey_bp = Blueprint('ai_journey', __name__)

@ai_journey_bp.route('/ai_journey/hello', methods=['GET'])
def hello():
    """Test endpoint"""
    return jsonify({"message": "Hello from ai_journey API!"}), 200

@ai_journey_bp.route('/ai_journey/protected', methods=['GET'])
@token_required
def protected(current_user):
    """Protected test endpoint"""
    return jsonify({"message": "This is a protected endpoint", "user": current_user}), 200
