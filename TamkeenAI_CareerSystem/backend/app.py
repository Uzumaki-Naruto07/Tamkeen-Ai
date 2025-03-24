"""
Main Application Module

This module initializes and configures the Tamkeen AI Career System backend application.
"""

import os
import logging
import traceback
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from functools import wraps

# Import settings
from backend.config.settings import (
    API_PREFIX, DEBUG, ENV, CORS_ORIGINS,
    SECRET_KEY, LOG_LEVEL, LOG_FORMAT
)

# Import utilities
from backend.utils.auth import decode_token
from backend.utils.date_utils import now, format_date

# Setup logger
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format=LOG_FORMAT
)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY
app.config['DEBUG'] = DEBUG
app.config['ENV'] = ENV

# Configure CORS
CORS(app, resources={r"/api/*": {"origins": CORS_ORIGINS}})

# Import API routes
from backend.api.routes.auth import auth_blueprint
from backend.api.routes.user import user_blueprint
from backend.api.routes.job import job_blueprint
from backend.api.routes.resume import resume_blueprint
from backend.api.routes.career import career_blueprint
from backend.api.routes.analytics import analytics_blueprint

# Register blueprints
app.register_blueprint(auth_blueprint, url_prefix=f"{API_PREFIX}/auth")
app.register_blueprint(user_blueprint, url_prefix=f"{API_PREFIX}/users")
app.register_blueprint(job_blueprint, url_prefix=f"{API_PREFIX}/jobs")
app.register_blueprint(resume_blueprint, url_prefix=f"{API_PREFIX}/resumes")
app.register_blueprint(career_blueprint, url_prefix=f"{API_PREFIX}/careers")
app.register_blueprint(analytics_blueprint, url_prefix=f"{API_PREFIX}/analytics")


# Authentication middleware
@app.before_request
def authenticate():
    """Authenticate user from token before request"""
    # Skip authentication for auth routes and health check
    if request.path.startswith(f"{API_PREFIX}/auth") or request.path == f"{API_PREFIX}/health":
        return
    
    # Get token from header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        g.user = None
        g.user_role = None
        return
    
    # Get token
    token = auth_header.split(' ')[1]
    
    # Decode token
    payload = decode_token(token)
    if not payload:
        g.user = None
        g.user_role = None
        return
    
    # Set user info in request context
    g.user = payload.get('sub')
    g.user_role = payload.get('role', 'user')


# Create authentication decorator
def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not g.user:
            return jsonify({
                'success': False,
                'error': 'Authentication required'
            }), 401
        return f(*args, **kwargs)
    return decorated


# Create role-based authorization decorator
def require_role(roles):
    """Decorator to require specific role(s)"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not g.user:
                return jsonify({
                    'success': False,
                    'error': 'Authentication required'
                }), 401
            
            if g.user_role not in roles:
                return jsonify({
                    'success': False,
                    'error': 'Permission denied'
                }), 403
            
            return f(*args, **kwargs)
        return decorated
    return decorator


# Error handlers
@app.errorhandler(Exception)
def handle_exception(e):
    """Handle exceptions"""
    # Log the error
    logger.error(f"Unhandled exception: {str(e)}")
    logger.error(traceback.format_exc())
    
    # HTTP exceptions
    if isinstance(e, HTTPException):
        return jsonify({
            'success': False,
            'error': e.description
        }), e.code
    
    # Generic exceptions
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


# Health check endpoint
@app.route(f"{API_PREFIX}/health", methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'Tamkeen AI Career System is running',
        'time': format_date(now()),
        'version': '1.0.0',
        'environment': ENV
    })


if __name__ == '__main__':
    # Run the app
    from backend.config.settings import API_HOST, API_PORT
    
    # Log startup
    logger.info(f"Starting Tamkeen AI Career System on {API_HOST}:{API_PORT}")
    logger.info(f"Environment: {ENV}")
    logger.info(f"Debug mode: {DEBUG}")
    
    # Run the app
    app.run(host=API_HOST, port=API_PORT, debug=DEBUG)