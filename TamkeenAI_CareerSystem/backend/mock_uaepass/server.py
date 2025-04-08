from flask import Flask, request, jsonify, make_response
import uuid
import time
import json
import os
from datetime import datetime, timedelta
from flask_cors import CORS

app = Flask(__name__)
# More permissive CORS configuration with explicit allowed headers
CORS(app, 
     resources={r"/*": {
         "origins": "*", 
         "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
         "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
         "expose_headers": ["Content-Type", "Authorization"],
         "supports_credentials": True
     }})

# Helper to add CORS headers to all responses
@app.after_request
def add_cors_headers(response):
    # Always allow requests from localhost:3000
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
    response.headers['Access-Control-Max-Age'] = '86400'  # 24 hours
    return response

# Handle OPTIONS requests explicitly for preflight requests
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    response = make_response()
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
    response.headers['Access-Control-Max-Age'] = '86400'  # 24 hours
    return response

# In-memory storage for mock data
uaepass_sessions = {}
uaepass_users = {
    "test@example.com": {
        "uuid": "1234567890",
        "fullNameEn": "John Doe",
        "fullNameAr": "جون دو",
        "email": "test@example.com",
        "mobile": "971501234567",
        "idn": "784-1234-1234567-1",
        "userType": "UAE Resident",
        "gender": "Male"
    }
}

# New user registration storage
registered_users = {}

# Create new UAE PASS account endpoint
@app.route('/api/auth/register/uaepass/create', methods=['POST'])
def create_uaepass_account():
    """Create a new UAE PASS account"""
    try:
        data = request.json or {}
        name = data.get('name', '')
        identifier = data.get('identifier', '')
        
        if not name or not identifier:
            return jsonify({"success": False, "error": "Name and identifier are required"}), 400
        
        # Create a unique user ID
        user_id = str(uuid.uuid4())
        
        # Store the new user
        registered_users[identifier] = {
            "uuid": user_id,
            "fullNameEn": name,
            "email": identifier if '@' in identifier else None,
            "mobile": identifier if identifier.startswith('971') else None,
            "idn": identifier if not '@' in identifier and not identifier.startswith('971') else None,
            "created_at": time.time()
        }
        
        return jsonify({
            "success": True,
            "message": "Account created successfully",
            "sessionId": user_id,
        }), 200
    except Exception as e:
        print(f"Account creation error: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/mock/uaepass/initiate', methods=['POST'])
def initiate_uaepass():
    """Initiate a UAE PASS session"""
    try:
        session_id = str(uuid.uuid4())
        
        # Get the redirectUrl from the request if provided
        data = request.json or {}
        provided_redirect_url = data.get('redirectUrl', 'http://localhost:3000/callback')
        
        # Instead of redirecting to UAE PASS, create a direct callback URL that simulates
        # a successful UAE PASS authentication
        redirect_url = f"{provided_redirect_url}?sessionId={session_id}&state=uaepass-auth&code=mock_auth_code"
        
        # Store session with timestamp
        uaepass_sessions[session_id] = {
            "created_at": time.time(),
            "status": "initiated",
            "redirect_url": redirect_url
        }
        
        return jsonify({
            "success": True,
            "sessionId": session_id,
            "redirectUrl": redirect_url
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Add new route to match frontend expectations
@app.route('/api/auth/register/uaepass/init', methods=['GET', 'POST'])
def frontend_initiate_uaepass():
    """Endpoint that matches frontend expectation for UAE PASS initiation"""
    try:
        session_id = str(uuid.uuid4())
        
        # Get the redirectUrl from the request if provided
        data = request.json or {}
        provided_redirect_url = data.get('redirectUrl', 'http://localhost:3000/callback')
        
        # Instead of redirecting to UAE PASS, create a direct callback URL that simulates
        # a successful UAE PASS authentication
        redirect_url = f"{provided_redirect_url}?sessionId={session_id}&state=uaepass-auth&code=mock_auth_code"
        
        # Store session with timestamp
        uaepass_sessions[session_id] = {
            "created_at": time.time(),
            "status": "initiated",
            "redirect_url": redirect_url
        }
        
        return jsonify({
            "success": True,
            "sessionId": session_id,
            "redirectUrl": redirect_url
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/auth/register/uaepass/validate', methods=['POST'])
def frontend_validate_uaepass():
    """Endpoint that matches frontend expectation for UAE PASS validation"""
    try:
        data = request.json or {}
        session_id = data.get('sessionId')
        code = data.get('code')
        identifier = data.get('identifier')
        name = data.get('name')
        
        # Log request data for debugging
        print(f"Validate request: sessionId={session_id}, code={code}")
        
        # Return user data based on identifier if provided 
        if identifier and name:
            # This is for direct login with name and identifier
            user_data = None
            
            # Check if this user is already registered
            if identifier in registered_users:
                user_data = registered_users[identifier]
            elif identifier in uaepass_users:
                user_data = uaepass_users[identifier]
            else:
                # Create a new user entry
                user_id = str(uuid.uuid4())
                user_data = {
                    "uuid": user_id,
                    "fullNameEn": name,
                    "email": identifier if '@' in identifier else None,
                    "mobile": identifier if identifier.startswith('971') else None,
                    "idn": identifier if not '@' in identifier and not identifier.startswith('971') else None,
                    "sessionId": user_id
                }
                registered_users[identifier] = user_data
            
            return jsonify({
                "success": True,
                "userData": user_data,
                "verificationRequired": True,
                "verificationCode": "123456"  # Mock verification code
            }), 200
            
        # If we have a valid session ID
        if session_id and session_id in uaepass_sessions:
            # For testing purposes, we'll simulate a successful validation
            session = uaepass_sessions[session_id]
            session["status"] = "validated"
        # If we don't have a valid session ID but we have a code (from redirect)
        elif code == "mock_auth_code" and not session_id:
            # Create a new session
            session_id = str(uuid.uuid4())
            uaepass_sessions[session_id] = {
                "created_at": time.time(),
                "status": "validated"
            }
        else:
            return jsonify({"success": False, "error": "Invalid session ID or authorization code"}), 400
        
        # Get user data
        user = None
        
        # Try to find the user in our registered database first
        for identifier, user_data in registered_users.items():
            if user_data.get("uuid") == session_id:
                user = user_data
                break
                
        # If not found, use test user
        if not user:
            user = list(uaepass_users.values())[0]
        
        # Add session ID to the user data
        user_data = {**user, "sessionId": session_id}
        
        return jsonify({
            "success": True,
            "userData": user_data,
            "verificationRequired": True,
            "verificationCode": "123456"  # Mock verification code
        }), 200
    except Exception as e:
        print(f"Validation error: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/mock/uaepass/validate', methods=['POST'])
def validate_uaepass():
    """Validate a UAE PASS session"""
    try:
        data = request.json
        session_id = data.get('sessionId')
        
        if not session_id or session_id not in uaepass_sessions:
            return jsonify({"success": False, "error": "Invalid session ID"}), 400
        
        # For testing purposes, we'll simulate a successful validation
        session = uaepass_sessions[session_id]
        session["status"] = "validated"
        
        # Randomly select a test user
        user = list(uaepass_users.values())[0]
        
        return jsonify({
            "success": True,
            "userData": user,
            "verificationRequired": True,
            "verificationCode": "123456"  # Mock verification code
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/mock/uaepass/verify', methods=['POST'])
def verify_uaepass():
    """Verify the code sent to the user"""
    try:
        data = request.json
        session_id = data.get('sessionId')
        code = data.get('code')
        
        if not session_id or session_id not in uaepass_sessions:
            return jsonify({"success": False, "error": "Invalid session ID"}), 400
            
        if code != "123456":  # Mock verification code
            return jsonify({"success": False, "error": "Invalid verification code"}), 400
        
        # Mark session as verified
        session = uaepass_sessions[session_id]
        session["status"] = "verified"
        
        # Generate mock tokens
        access_token = f"mock_access_token_{uuid.uuid4()}"
        refresh_token = f"mock_refresh_token_{uuid.uuid4()}"
        
        # Mock user data
        user = list(uaepass_users.values())[0]
        
        return jsonify({
            "success": True,
            "tokens": {
                "access": access_token,
                "refresh": refresh_token
            },
            "user": {
                "id": user["uuid"],
                "email": user["email"],
                "name": user["fullNameEn"],
                "is_verified": True
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Utility route to list all active sessions (for debugging)
@app.route('/mock/uaepass/sessions', methods=['GET'])
def list_sessions():
    return jsonify(uaepass_sessions), 200

@app.route('/api/auth/register/uaepass/verify', methods=['POST'])
def frontend_verify_uaepass():
    """Endpoint that matches frontend expectation for UAE PASS verification"""
    try:
        data = request.json
        session_id = data.get('sessionId')
        code = data.get('code')
        
        if not session_id or session_id not in uaepass_sessions:
            return jsonify({"success": False, "error": "Invalid session ID"}), 400
            
        if code != "123456":  # Mock verification code
            return jsonify({"success": False, "error": "Invalid verification code"}), 400
        
        # Mark session as verified
        session = uaepass_sessions[session_id]
        session["status"] = "verified"
        
        # Generate mock tokens
        access_token = f"mock_access_token_{uuid.uuid4()}"
        refresh_token = f"mock_refresh_token_{uuid.uuid4()}"
        
        # Get user data
        user = None
        
        # Try to find the user in our registered database first
        for identifier, user_data in registered_users.items():
            if user_data.get("uuid") == session_id:
                user = user_data
                break
                
        # If not found, use test user
        if not user:
            user = list(uaepass_users.values())[0]
        
        return jsonify({
            "success": True,
            "tokens": {
                "access": access_token,
                "refresh": refresh_token
            },
            "user": {
                "id": user["uuid"],
                "email": user.get("email", ""),
                "name": user.get("fullNameEn", ""),
                "is_verified": True
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005, debug=True) 