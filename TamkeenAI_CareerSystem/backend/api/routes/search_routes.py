from flask import Blueprint, request, jsonify
import logging
from api.middleware.auth_middleware import token_required

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
search_bp = Blueprint('search', __name__)

@search_bp.route('/search/hello', methods=['GET'])
def hello():
    """Test endpoint"""
    return jsonify({"message": "Hello from search API!"}), 200

@search_bp.route('/search/protected', methods=['GET'])
@token_required
def protected(current_user):
    """Protected test endpoint"""
    return jsonify({"message": "This is a protected endpoint", "user": current_user}), 200
