from flask import Blueprint, request, jsonify
import logging
from api.middleware.auth_middleware import token_required

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """Login a user and return a JWT token"""
    try:
        data = request.json
        
        # Basic validation
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({"error": "Username and password are required"}), 400
            
        # In a real app, validate against database
        # Mocked for development
        if data['username'] == 'admin' and data['password'] == 'admin123':
            # Generate a mock token for development
            token = "development-token"
            return jsonify({
                "token": token,
                "user": {
                    "id": 1,
                    "username": "admin",
                    "email": "admin@example.com",
                    "roles": ["admin", "user"]
                }
            }), 200
        elif data['username'] == 'user' and data['password'] == 'user123':
            # Generate a mock token for development
            token = "development-token"
            return jsonify({
                "token": token,
                "user": {
                    "id": 2,
                    "username": "user",
                    "email": "user@example.com",
                    "roles": ["user"]
                }
            }), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401
            
    except Exception as e:
        logger.error(f"Error in login: {str(e)}")
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.json
        
        # Basic validation
        if not data or 'username' not in data or 'password' not in data or 'email' not in data:
            return jsonify({"error": "Username, password, and email are required"}), 400
            
        # In a real app, save to database
        # Mocked for development
        return jsonify({
            "message": "User registered successfully",
            "user": {
                "id": 3,
                "username": data['username'],
                "email": data['email'],
                "roles": ["user"]
            }
        }), 201
            
    except Exception as e:
        logger.error(f"Error in register: {str(e)}")
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Get the current user's information"""
    try:
        return jsonify({
            "user": current_user
        }), 200
            
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/auth/logout', methods=['POST'])
@token_required
def logout(current_user):
    """Logout a user (client-side only for JWT)"""
    try:
        # With JWT, logout is primarily client-side
        # Just return a success message
        return jsonify({
            "message": "Logged out successfully"
        }), 200
            
    except Exception as e:
        logger.error(f"Error in logout: {str(e)}")
        return jsonify({"error": str(e)}), 500 