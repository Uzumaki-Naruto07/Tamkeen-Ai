"""
Main API Module

This module initializes the Flask application and configures routes, middleware,
and error handlers for the Tamkeen AI Career Intelligence System API.
"""

import os
import json
import logging
import uuid
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime

from flask import Flask, request, jsonify, g
try:
    from flask_cors import CORS
except ImportError:
    logging.warning("flask_cors not installed. Install with: pip install flask-cors")
    # Stub if not installed
    def CORS(app):
        return app

try:
    from flask_jwt_extended import JWTManager
except ImportError:
    logging.warning("flask_jwt_extended not installed. Install with: pip install flask-jwt-extended")
    # Stub if not installed
    class JWTManager:
        def __init__(self, app=None):
            pass

# Import settings
from backend.config.settings import (
    API_PREFIX, SECRET_KEY, JWT_SECRET_KEY, JWT_EXPIRATION,
    DEBUG, APP_NAME, APP_VERSION, ENV
)

# Import utilities
from backend.utils.api_utils import error_response

# Import routes
from backend.api.routes.user_routes import user_bp
from backend.api.routes.job_routes import job_bp
from backend.api.routes.resume_routes import resume_bp
from backend.api.routes.career_routes import career_bp
from backend.api.routes.analytics_routes import analytics_bp

# Setup logger
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY
app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = JWT_EXPIRATION
app.config['DEBUG'] = DEBUG

# Configure CORS
CORS(app)

# Initialize JWT
jwt = JWTManager(app)

# Register blueprints with prefix
app.register_blueprint(user_bp, url_prefix=f"{API_PREFIX}/users")
app.register_blueprint(job_bp, url_prefix=f"{API_PREFIX}/jobs")
app.register_blueprint(resume_bp, url_prefix=f"{API_PREFIX}/resumes")
app.register_blueprint(career_bp, url_prefix=f"{API_PREFIX}/career")
app.register_blueprint(analytics_bp, url_prefix=f"{API_PREFIX}/analytics")


@app.before_request
def before_request():
    """Pre-request middleware"""
    # Generate request ID
    g.request_id = str(uuid.uuid4())
    
    # Log request
    logger.info(f"Request: {request.method} {request.path} [ID: {g.request_id}]")
    
    # Track request start time for performance monitoring
    g.start_time = datetime.now()


@app.after_request
def after_request(response):
    """Post-request middleware"""
    # Add request ID to response headers
    response.headers['X-Request-ID'] = g.request_id
    
    # Calculate request duration
    if hasattr(g, 'start_time'):
        duration = (datetime.now() - g.start_time).total_seconds()
        response.headers['X-Response-Time'] = str(duration)
        
        # Log request completion
        logger.info(f"Request completed: {request.method} {request.path} " +
                   f"[ID: {g.request_id}] in {duration:.3f}s with status {response.status_code}")
    
    return response


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return error_response("Resource not found", 404)


@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    logger.error(f"Server error: {str(error)}")
    return error_response("Internal server error", 500)


@app.route(f"{API_PREFIX}/status", methods=["GET"])
def status():
    """API status endpoint"""
    return jsonify({
        "status": "success",
        "service": APP_NAME,
        "version": APP_VERSION,
        "environment": ENV,
        "timestamp": datetime.now().isoformat()
    }), 200


if __name__ == "__main__":
    app.run(debug=DEBUG) 