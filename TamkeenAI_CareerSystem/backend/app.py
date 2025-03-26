"""
Main Application Module

This module initializes and configures the Tamkeen AI Career System backend application.
"""

import os
import json
import logging
import traceback
from datetime import datetime
from functools import wraps
from typing import Dict, List, Any, Optional, Tuple, Union, Callable

# Import Flask and extensions
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

# Import settings
from backend.config.settings import (
    API_PREFIX, DEBUG, ENV, CORS_ORIGINS,
    SECRET_KEY, LOG_LEVEL, LOG_FORMAT
)

# Import utilities
from backend.utils.auth import decode_token
from backend.utils.date_utils import now, format_date

# Setup logger
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
    """
    Authenticate user from token before request
    """
    # Skip authentication for auth routes
    if request.path.startswith(f"{API_PREFIX}/auth"):
        return
    
    # Get token from header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        g.user = None
        return
    
    # Get token
    token = auth_header.split(' ')[1]
    
    # Decode token
    payload = decode_token(token)
    if not payload:
        g.user = None
        return
    
    # Set user ID in request context
    g.user = payload.get('sub')


# Error handlers
@app.errorhandler(Exception)
def handle_exception(e):
    """
    Handle exceptions
    """
    # Log the error
    logger.error(f"Unhandled exception: {str(e)}")
    logger.error(traceback.format_exc())
    
    # HTTP exceptions
    if isinstance(e, HTTPException):
        return jsonify({
            'success': False,
            'error': e.description,
            'code': e.code
        }), e.code
    
    # Generic exceptions
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'code': 500
    }), 500


# Create authentication decorator
def require_auth(f):
    """
    Decorator to require authentication
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        if not g.user:
            return jsonify({
                'success': False,
                'error': 'Authentication required',
                'code': 401
            }), 401
        return f(*args, **kwargs)
    return decorated


# Health check endpoint
@app.route(f"{API_PREFIX}/health", methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
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
    app.run(host=API_HOST, port=API_PORT, debug=DEBUG)