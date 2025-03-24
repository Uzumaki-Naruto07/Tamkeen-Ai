"""
Main Application Module

This module creates and configures the Flask application for the 
Tamkeen AI Career Intelligence System.
"""

import os
import json
import logging
import logging.config
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from werkzeug.exceptions import HTTPException
from werkzeug.middleware.proxy_fix import ProxyFix

# Import settings
from backend.config.settings import (
    DEBUG, SECRET_KEY, JWT_SECRET_KEY, JWT_ACCESS_TOKEN_EXPIRES,
    JWT_REFRESH_TOKEN_EXPIRES, CORS_ORIGINS, LOG_CONFIG, UPLOAD_FOLDER
)

# Import API endpoints
from backend.api.endpoints import get_api_blueprint

# Setup logger
logging.config.dictConfig(LOG_CONFIG)
logger = logging.getLogger(__name__)


def create_app(test_config=None):
    """
    Create and configure the Flask application
    
    Args:
        test_config: Test configuration
        
    Returns:
        Flask: Flask application
    """
    # Create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    
    # Load configuration
    app.config.from_mapping(
        SECRET_KEY=SECRET_KEY,
        JWT_SECRET_KEY=JWT_SECRET_KEY,
        JWT_ACCESS_TOKEN_EXPIRES=JWT_ACCESS_TOKEN_EXPIRES,
        JWT_REFRESH_TOKEN_EXPIRES=JWT_REFRESH_TOKEN_EXPIRES,
        UPLOAD_FOLDER=UPLOAD_FOLDER,
        DEBUG=DEBUG
    )
    
    # Handle test configuration
    if test_config is not None:
        app.config.from_mapping(test_config)
    
    # Configure CORS
    CORS(app, origins=CORS_ORIGINS, supports_credentials=True)
    
    # Configure JWT
    jwt = JWTManager(app)
    
    # Configure proxy for proper IP handling
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)
    
    # Create upload directory if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register API blueprint
    app.register_blueprint(get_api_blueprint())
    
    # Error handlers
    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        """Handle HTTP exceptions"""
        response = {
            "error": {
                "code": e.code,
                "name": e.name,
                "description": e.description
            }
        }
        return jsonify(response), e.code
    
    @app.errorhandler(Exception)
    def handle_exception(e):
        """Handle generic exceptions"""
        logger.exception("Unhandled exception")
        
        response = {
            "error": {
                "code": 500,
                "name": "Internal Server Error",
                "description": "An unexpected error occurred"
            }
        }
        
        if DEBUG:
            response["error"]["exception"] = str(e)
        
        return jsonify(response), 500
    
    # Log requests in development mode
    if DEBUG:
        @app.before_request
        def log_request():
            """Log request details"""
            logger.debug(f"Request: {request.method} {request.url}")
            if request.headers:
                logger.debug(f"Headers: {dict(request.headers)}")
            if request.args:
                logger.debug(f"Args: {dict(request.args)}")
            if request.form:
                logger.debug(f"Form: {dict(request.form)}")
            if request.json:
                logger.debug(f"JSON: {request.json}")
    
    # Default route
    @app.route('/')
    def index():
        """Root endpoint"""
        return jsonify({
            "name": "Tamkeen AI Career Intelligence System API",
            "status": "online",
            "version": "1.0.0"
        })
    
    logger.info("Application initialized")
    
    return app


if __name__ == '__main__':
    # Get port from environment or use default
    port = int(os.environ.get('PORT', 5000))
    
    # Create and run app
    app = create_app()
    app.run(host='0.0.0.0', port=port, debug=DEBUG)