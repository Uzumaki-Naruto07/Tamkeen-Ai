from flask import Blueprint, request, jsonify
import logging
from api.middleware.auth_middleware import token_required

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
learning_bp = Blueprint('learning', __name__)

@learning_bp.route('/learning/hello', methods=['GET'])
def hello():
    """Test endpoint"""
    return jsonify({"message": "Hello from learning API!"}), 200

@learning_bp.route('/learning/protected', methods=['GET'])
@token_required
def protected(current_user):
    """Protected test endpoint"""
    return jsonify({"message": "This is a protected endpoint", "user": current_user}), 200
