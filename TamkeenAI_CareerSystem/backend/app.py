from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging

# Import route modules
from .api.routes.auth_routes import auth_bp
from api.routes.resume_routes import resume_bp
from api.routes.career_routes import career_bp
from api.routes.interview_routes import interview_bp
from api.routes.job_routes import job_bp
from api.routes.analytics_routes import analytics_bp
from api.routes.admin_routes import admin_bp
from api.routes.user_routes import user_bp
from api.routes.assessment_routes import assessment_bp
from api.routes.feedback_routes import feedback_bp
from api.routes.gamification_routes import gamification_bp
from api.routes.ai_journey_routes import ai_journey_bp
from api.routes.learning_routes import learning_bp
from api.routes.skill_routes import skill_bp
from api.routes.notification_routes import notification_bp
from api.routes.settings_routes import settings_bp
from api.routes.emotion_routes import emotion_bp
from api.routes.pdf_routes import pdf_bp
from api.routes.search_routes import search_bp
from api.routes.chat_routes import chat_bp

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if os.getenv('FLASK_DEBUG') == '1' else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log')
    ]
)

logger = logging.getLogger(__name__)

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
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    
    # Health check endpoint
    @app.route('/api/health-check')
    def health_check():
        return jsonify({
            "status": "ok",
            "version": "1.0.0",
            "environment": os.getenv('FLASK_ENV', 'development')
        })
    
    # Register all blueprints with the /api prefix
    blueprints = [
        auth_bp, resume_bp, career_bp, interview_bp, job_bp, 
        analytics_bp, admin_bp, user_bp, assessment_bp, feedback_bp,
        gamification_bp, ai_journey_bp, learning_bp, skill_bp,
        notification_bp, settings_bp, emotion_bp, pdf_bp, search_bp, chat_bp
    ]
    
    for bp in blueprints:
        app.register_blueprint(bp, url_prefix='/api')
        
    logger.info(f"Registered {len(blueprints)} API blueprints")
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Resource not found"}), 404
    
    @app.errorhandler(500)
    def server_error(error):
        logger.error(f"Server error: {error}")
        return jsonify({"error": "Internal server error"}), 500
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": "Bad request"}), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({"error": "Unauthorized"}), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({"error": "Forbidden"}), 403
        
    return app

# Create app instance
app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG') == '1'
    
    logger.info(f"Starting Tamkeen AI backend server on port {port}")
    logger.info(f"Debug mode: {'enabled' if debug else 'disabled'}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
