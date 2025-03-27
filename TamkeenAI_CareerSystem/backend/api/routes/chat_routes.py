from flask import Blueprint, request, jsonify
import logging
from api.middleware.auth_middleware import token_required

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/chat/hello', methods=['GET'])
def hello():
    """Test endpoint"""
    return jsonify({"message": "Hello from chat API!"}), 200

@chat_bp.route('/chat/protected', methods=['GET'])
@token_required
def protected(current_user):
    """Protected test endpoint"""
    return jsonify({"message": "This is a protected endpoint", "user": current_user}), 200
