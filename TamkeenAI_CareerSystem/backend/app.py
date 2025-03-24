"""
Application Module

This module initializes and configures the Flask application for the
Tamkeen AI Career Intelligence System.
"""

import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from logging.config import dictConfig

# Import settings
from config.settings import SECRET_KEY, JWT_SECRET_KEY, LOG_CONFIG, API_PREFIX

# Import API blueprint
from api.endpoints import get_api_blueprint

# Configure logging
dictConfig(LOG_CONFIG)


def create_app(test_config=None):
    """
    Create and configure the Flask application
    
    Args:
        test_config: Test configuration
        
    Returns:
        Flask application
    """
    # Create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    
    # Configure app
    app.config.from_mapping(
        SECRET_KEY=SECRET_KEY,
        JWT_SECRET_KEY=JWT_SECRET_KEY,
        JWT_ACCESS_TOKEN_EXPIRES=3600,  # 1 hour
        JWT_REFRESH_TOKEN_EXPIRES=2592000,  # 30 days
        UPLOAD_FOLDER=os.path.join(os.getcwd(), 'uploads'),
    )
    
    if test_config is None:
        # Load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # Load the test config if passed in
        app.config.from_mapping(test_config)
    
    # Register API blueprint
    app.register_blueprint(get_api_blueprint())
    
    # Initialize JWT
    jwt = JWTManager(app)
    
    # Enable CORS
    CORS(app)
    
    # Register a simple route
    @app.route('/')
    def home():
        return jsonify({
            "name": "Tamkeen AI Career Intelligence System",
            "version": "1.0.0",
            "status": "online",
            "api_endpoint": API_PREFIX
        })
    
    # Register error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404
    
    @app.errorhandler(500)
    def server_error(e):
        app.logger.error(f"Server error: {e}")
        return jsonify({"error": "Internal server error"}), 500
    
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Bad request", "message": str(e)}), 400
    
    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401
    
    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({"error": "Forbidden", "message": str(e)}), 403
    
    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"error": "Method not allowed"}), 405
    
    @app.errorhandler(422)
    def unprocessable_entity(e):
        return jsonify({"error": "Unprocessable entity", "message": str(e)}), 422
    
    # Create necessary directories
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Log application startup
    app.logger.info("Tamkeen AI Career Intelligence System initialized")
    
    return app


# For running with 'flask run'
app = create_app()

if __name__ == '__main__':
    # Run the app if script is executed directly
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)