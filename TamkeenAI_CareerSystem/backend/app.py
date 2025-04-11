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

from flask import Flask, jsonify, request
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
# Import the new interview controller
from api.controllers.interview_controller import interview_bp as interview_coach_bp
from api.routes.ats_routes import ats_bp

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
    
    # Configure CORS properly with Flask-CORS
    frontend_url = os.getenv('FRONTEND_URL', 'https://tamkeen-frontend.onrender.com')
    allowed_origins = [
        frontend_url,
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "https://hessa-tamkeen-ai.netlify.app",
        "https://hessa-tamkeen-ai.onrender.com",
        "https://tamkeen-frontend.onrender.com",
    ]
    
    # Apply CORS to all routes
    CORS(app, resources={r"/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
        "supports_credentials": True
    }})
    
    # Log CORS configuration
    logger.info(f"CORS configured with allowed origins: {allowed_origins}")
    
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
    # Register the new interview coach blueprint with a unique name
    app.register_blueprint(interview_coach_bp, url_prefix='/api/interviews', name='interview_coach')
    app.register_blueprint(ats_bp)
    
    # Add a route handler for user profile by ID
    @app.route('/api/user/profile/<user_id>', methods=['GET', 'OPTIONS'])
    def get_user_profile_by_id(user_id):
        try:
            # This is a mock implementation - in production you would fetch the actual user
            # Import here to check MongoDB status during health check
            from api.utils.mock_data import get_mock_user_profile
            
            # Generate mock user profile data
            profile_data = get_mock_user_profile(user_id)
            
            return jsonify({
                "status": "success",
                "data": profile_data
            })
        except Exception as e:
            logger.error(f"Error getting user profile: {str(e)}")
            return jsonify({
                "status": "error",
                "message": f"Failed to get user profile: {str(e)}"
            }), 500
    
    @app.route('/api/health-check', methods=['GET', 'OPTIONS'])
    def health_check():
        """Health check endpoint"""
        # Handle OPTIONS request
        if request.method == 'OPTIONS':
            response = jsonify({'status': 'success'})
            return response
            
        # Import here to check MongoDB status during health check
        from api.database.connector import db
        mongo_status = "connected" if db is not None else "disconnected (using mock)"
        
        return jsonify({
            "status": "success",
            "message": "API is running",
            "version": "1.0.0",
            "mongodb": mongo_status
        })
    
    # Simple health check at root path - useful for some monitoring systems
    @app.route('/health-check', methods=['GET'])
    def simple_health_check():
        """Simple health check endpoint at root level"""
        return jsonify({"status": "ok"}), 200
    
    @app.route('/api/health', methods=['GET', 'OPTIONS'])
    def api_health():
        """Health check endpoint (alternative path)"""
        # Handle OPTIONS request
        if request.method == 'OPTIONS':
            response = jsonify({'status': 'success'})
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept'
            return response
            
        # Import here to check MongoDB status during health check
        from api.database.connector import db
        mongo_status = "connected" if db is not None else "disconnected (using mock)"
        
        # Set CORS headers directly
        response = jsonify({
            "status": "success",
            "message": "API is running",
            "version": "1.0.0",
            "mongodb": mongo_status
        })
        
        # Add CORS headers directly to this response
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept'
        
        return response
    
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
            
    @app.route('/api/dashboard/data')
    def get_dashboard_data():
        """Get general dashboard data"""
        try:
            # Import here to check MongoDB status during health check
            from api.utils.mock_data import get_mock_dashboard_data
            
            # Generate mock dashboard data for a generic user
            data = get_mock_dashboard_data("current")
            
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
            
    @app.route('/api/data')
    def get_data():
        """Get general data (alias for dashboard data)"""
        try:
            # Import here to check MongoDB status during health check
            from api.utils.mock_data import get_mock_dashboard_data
            
            # Generate mock dashboard data for a generic user
            data = get_mock_dashboard_data("current")
            
            return jsonify({
                "status": "success",
                "data": data
            })
        except Exception as e:
            logger.error(f"Error getting data: {str(e)}")
            return jsonify({
                "status": "error",
                "message": f"Failed to get data: {str(e)}"
            }), 500
    
    @app.route('/health')
    def health_check_new():
        """Health check endpoint"""
        response = jsonify({"status": "healthy"})
        
        # Add CORS headers directly to this response
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept'
        
        return response
    
    # Add Hugging Face API endpoints
    @app.route('/api/huggingface/status', methods=['GET'])
    def huggingface_status():
        """Check Hugging Face API connection status"""
        try:
            # Direct approach using huggingface_hub
            import os
            from huggingface_hub import login, HfApi
            
            # Get token directly from environment
            hf_token = os.environ.get('HF_TOKEN')
            
            # Debug info
            print(f"HF_TOKEN present: {hf_token is not None}")
            
            if not hf_token:
                return jsonify({"connected": False, "message": "No API token available"}), 200
            
            try:
                # Login to HuggingFace
                login(token=hf_token)
                
                # Test connection with a simple call
                api = HfApi(token=hf_token)
                # Just check if we can list our models (lightweight call)
                _ = list(api.list_models(limit=1))
                
                return jsonify({"connected": True, "message": "Successfully connected to Hugging Face API"}), 200
            except Exception as e:
                logger.warning(f"Hugging Face connection failed: {str(e)}")
                return jsonify({"connected": False, "message": f"Failed to connect: {str(e)}"}), 200
        except ImportError as e:
            return jsonify({"connected": False, "message": f"Hugging Face libraries not installed: {str(e)}"}), 200
    
    @app.route('/api/huggingface/connect', methods=['POST'])
    def huggingface_connect():
        """Connect to Hugging Face API with token"""
        try:
            # Direct approach using huggingface_hub
            import os
            from huggingface_hub import login, HfApi
            
            # Get the token from request if provided, otherwise use environment
            request_data = request.get_json() or {}
            token = request_data.get('token', None) or os.environ.get('HF_TOKEN')
            
            # Debug info
            print(f"Token provided: {token is not None}")
            
            if not token:
                return jsonify({"connected": False, "message": "No API token available"}), 200
            
            try:
                # Login to HuggingFace
                login(token=token)
                
                # Test connection
                api = HfApi(token=token)
                _ = list(api.list_models(limit=1))
                
                return jsonify({"connected": True, "message": "Successfully connected to Hugging Face API"}), 200
            except Exception as e:
                logger.warning(f"Hugging Face connection failed: {str(e)}")
                return jsonify({"connected": False, "message": f"Failed to connect: {str(e)}"}), 200
        except Exception as e:
            # Catch any unexpected exceptions to prevent 500 errors
            logger.error(f"Unexpected error in huggingface_connect: {str(e)}")
            return jsonify({
                "connected": False, 
                "message": "An unexpected error occurred. Please check server logs.",
                "error": str(e)
            }), 200  # Return 200 even for errors to allow frontend to handle gracefully
    
    logger.info("Application initialized successfully")
    return app

def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='TamkeenAI Career System API')
    parser.add_argument('--host', default='0.0.0.0', help='Host to run the server on')
    parser.add_argument('--port', type=int, default=int(os.getenv('PORT', 5001)), help='Port to run the server on')
    parser.add_argument('--debug', action='store_true', help='Run in debug mode')
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    app = create_app()
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=args.debug)
