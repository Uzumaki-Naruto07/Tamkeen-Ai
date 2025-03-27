from flask import Blueprint, request, jsonify
import logging
from api.middleware.auth_middleware import token_required

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
notification_bp = Blueprint('notification', __name__)

@notification_bp.route('/notification/hello', methods=['GET'])
def hello():
    """Test endpoint"""
    return jsonify({"message": "Hello from notification API!"}), 200

@notification_bp.route('/notification/protected', methods=['GET'])
@token_required
def protected(current_user):
    """Protected test endpoint"""
    return jsonify({"message": "This is a protected endpoint", "user": current_user}), 200
