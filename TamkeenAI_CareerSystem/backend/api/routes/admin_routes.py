from flask import Blueprint, request, jsonify
import logging
from api.middleware.auth_middleware import token_required

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin/hello', methods=['GET'])
def hello():
    """Test endpoint"""
    return jsonify({"message": "Hello from admin API!"}), 200

@admin_bp.route('/admin/protected', methods=['GET'])
@token_required
def protected(current_user):
    """Protected test endpoint"""
    return jsonify({"message": "This is a protected endpoint", "user": current_user}), 200
