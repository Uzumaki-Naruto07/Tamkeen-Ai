"""
Simple test server for the interview coach controller
"""

import os
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from api.controllers.interview_controller import interview_bp

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Register the blueprint
app.register_blueprint(interview_bp)

# Add a health check endpoint
@app.route('/health-check')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "success",
        "message": "Test Interview API is running",
        "version": "1.0.0"
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    app.run(debug=True, host='0.0.0.0', port=port) 