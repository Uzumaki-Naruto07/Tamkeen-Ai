"""
TamkeenAI Career System API Server

This is the main entry point for the TamkeenAI Career System API.
It loads environment variables, sets up the Flask application, 
and registers all routes.
"""

# Load environment variables before any other imports
import os
from dotenv import load_dotenv

# Load environment variables at the very beginning
load_dotenv()

from flask import Flask, jsonify
from flask_cors import CORS
import argparse
import logging
import importlib
import jwt
from logging.handlers import RotatingFileHandler

# Import routes
from api.routes.user_routes import user_bp
from api.routes.chat_routes import chat_bp
from api.routes.resume_routes import resume_bp
from api.routes.job_routes import job_bp
from api.routes.interview_routes import interview_bp
from api.routes.assessment_routes import assessment_bp
from api.routes.analytics_routes import analytics_bp
from api.routes.career_routes import career_bp
from api.routes.skill_routes import skill_bp
from api.routes.dashboard_routes import dashboard_bp
from api.routes.auth_routes import auth_bp
from api.routes.confidence_chart_routes import confidence_charts

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        RotatingFileHandler('app.log', maxBytes=10485760, backupCount=3)
    ]
)

# Set MongoDB logging to INFO level
logging.getLogger('api.database.connector').setLevel(logging.INFO)
logging.getLogger('pymongo').setLevel(logging.INFO)

logger = logging.getLogger(__name__)
logger.info("Starting TamkeenAI Career System API Server")

# Import the resume_bp blueprint
try:
    from api.routes.resume_routes import resume_bp
except ImportError as e:
    print(f"Warning: Could not import resume_routes: {e}")
    resume_bp = None

from api.middleware.auth import jwt_required, role_required

# Add these functions for compatibility with resume_routes.py
def require_auth(f):
    """Compatibility wrapper for jwt_required"""
    return jwt_required(f)

def require_role(roles):
    """Compatibility wrapper for role_required"""
    return role_required(roles)

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Configure app
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///tamkeen.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size
    
    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register blueprints
    app.register_blueprint(user_bp, url_prefix='/api/user')
    app.register_blueprint(chat_bp, url_prefix='/api/chatgpt')
    app.register_blueprint(resume_bp, url_prefix='/api/resume')
    app.register_blueprint(job_bp, url_prefix='/api/jobs')
    app.register_blueprint(interview_bp, url_prefix='/api/interview')
    app.register_blueprint(assessment_bp, url_prefix='/api/assessment')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(career_bp, url_prefix='/api/career')
    app.register_blueprint(skill_bp, url_prefix='/api/skills')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(confidence_charts)
    
    @app.route('/api/health-check')
    def health_check():
        """Health check endpoint"""
        # Import here to check MongoDB status during health check
        from api.database.connector import db
        mongo_status = "connected" if db is not None else "disconnected (using mock)"
        
        return jsonify({
            "status": "success",
            "message": "API is running",
            "version": "1.0.0",
            "mongodb": mongo_status
        })
    
    @app.route('/api/test-dashboard/<user_id>')
    def test_dashboard(user_id):
        """Test endpoint to return mock dashboard data"""
        from api.utils.mock_data import get_mock_dashboard_data
        data = get_mock_dashboard_data(user_id)
        return jsonify({
            "status": "success",
            "data": data
        })
    
    @app.route('/api/dashboard/<user_id>')
    def get_dashboard(user_id):
        """Get dashboard data for a user"""
        from api.services.dashboard_service import get_full_dashboard_data
        try:
            data = get_full_dashboard_data(user_id)
            return jsonify({
                "status": "success",
                "data": data
            })
        except Exception as e:
            logger.error(f"Error getting dashboard data: {str(e)}")
            return jsonify({
                "status": "error",
                "message": f"Failed to get dashboard data: {str(e)}"
            }), 500
    
    return app

def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='TamkeenAI Career System API')
    parser.add_argument('--host', default='0.0.0.0', help='Host to run the server on')
    parser.add_argument('--port', type=int, default=int(os.getenv('PORT', 5001)), help='Port to run the server on')
    parser.add_argument('--debug', action='store_true', help='Run in debug mode')
    return parser.parse_args()

if __name__ == '__main__':
    args = parse_args()
    app = create_app()
    logger.info(f"Starting server on {args.host}:{args.port}")
    app.run(host=args.host, port=args.port, debug=args.debug)
