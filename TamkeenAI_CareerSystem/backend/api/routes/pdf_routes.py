from flask import Blueprint, request, jsonify
import logging
from api.middleware.auth_middleware import token_required

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
pdf_bp = Blueprint('pdf', __name__)

@pdf_bp.route('/pdf/hello', methods=['GET'])
def hello():
    """Test endpoint"""
    return jsonify({"message": "Hello from pdf API!"}), 200

@pdf_bp.route('/pdf/protected', methods=['GET'])
@token_required
def protected(current_user):
    """Protected test endpoint"""
    return jsonify({"message": "This is a protected endpoint", "user": current_user}), 200
