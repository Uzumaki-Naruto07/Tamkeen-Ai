"""
Main API application module.
Sets up Flask app with all routes and middleware.
"""

from flask import Flask, jsonify
from flask_cors import CORS
import os
import jwt
import logging
from logging.handlers import RotatingFileHandler

# Import routes
from .routes.auth_routes import auth_bp
from .middleware.auth import jwt_required, role_required

def create_app(config=None):
    """Create and configure the Flask application

    Args:
        config: Configuration dictionary or object

    Returns:
        Flask application instance
    """
    app = Flask(__name__)
    
    # Configure CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Configure app
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'tamkeen-ai-secret-key'),
        JWT_ACCESS_TOKEN_EXPIRES=3600,  # 1 hour
        JWT_REFRESH_TOKEN_EXPIRES=604800,  # 7 days
    )
    
    # Setup logging
    if not app.debug:
        if not os.path.exists('logs'):
            os.mkdir('logs')
        file_handler = RotatingFileHandler('logs/api.log', maxBytes=10240, backupCount=10)
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('API startup')

    # Register blueprints
    app.register_blueprint(auth_bp)
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        return jsonify({
            'message': 'API is healthy',
            'status': 'success'
        }), 200
    
    # User endpoints - protected by JWT
    @app.route('/api/user/profile', methods=['GET'])
    @jwt_required
    def get_profile(user_id, role):
        """Get user profile"""
        # This would typically fetch from a database
        sample_user = {
            'id': user_id,
            'name': 'Test User',
            'email': 'user@example.com',
            'role': role,
            'created_at': '2023-01-01T00:00:00Z',
            'skills': ['Python', 'JavaScript', 'React', 'Flask'],
            'bio': 'Experienced developer with passion for AI'
        }
        
        return jsonify({
            'message': 'Profile retrieved',
            'status': 'success',
            'data': sample_user
        }), 200
    
    # Admin-only endpoint
    @app.route('/api/admin/dashboard', methods=['GET'])
    @jwt_required
    @role_required(['admin'])
    def admin_dashboard(user_id, role):
        """Admin-only endpoint"""
        return jsonify({
            'message': 'Admin dashboard data',
            'status': 'success',
            'data': {
                'users_count': 42,
                'active_sessions': 12,
                'system_status': 'healthy'
            }
        }), 200
    
    @app.errorhandler(404)
    def not_found(error):
        """Not found error handler"""
        return jsonify({
            'message': 'Endpoint not found',
            'status': 'error'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        """Internal server error handler"""
        app.logger.error(f'Server Error: {error}')
        return jsonify({
            'message': 'Internal server error',
            'status': 'error'
        }), 500
    
    return app

# Create application instance
app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 