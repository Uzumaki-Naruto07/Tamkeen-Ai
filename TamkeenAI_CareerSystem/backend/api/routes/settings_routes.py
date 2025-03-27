from flask import Blueprint, request, jsonify
import logging
from api.middleware.auth_middleware import token_required

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/settings/hello', methods=['GET'])
def hello():
    """Test endpoint"""
    return jsonify({"message": "Hello from settings API!"}), 200

@settings_bp.route('/settings/protected', methods=['GET'])
@token_required
def protected(current_user):
    """Protected test endpoint"""
    return jsonify({"message": "This is a protected endpoint", "user": current_user}), 200
