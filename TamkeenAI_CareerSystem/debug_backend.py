#!/usr/bin/env python3
"""
Diagnostic script to identify backend issues.
This script will:
1. Check Python environment
2. Test imports 
3. Start a minimal server with detailed error logging
"""

import os
import sys
import traceback
import platform

# Print system information
print("\n=== SYSTEM INFORMATION ===")
print(f"Python version: {platform.python_version()}")
print(f"Platform: {platform.platform()}")
print(f"Working directory: {os.getcwd()}")
print(f"Script location: {os.path.abspath(__file__)}")
print(f"Python path: {sys.path}")

# Test critical imports
print("\n=== TESTING IMPORTS ===")
REQUIRED_PACKAGES = ["flask", "flask_cors", "json", "werkzeug"]

for package in REQUIRED_PACKAGES:
    try:
        __import__(package)
        print(f"✓ Successfully imported {package}")
    except ImportError as e:
        print(f"✗ Failed to import {package}: {str(e)}")
        print(f"  Try installing with: pip install {package}")

# Create and test a minimal Flask app with detailed error handling
print("\n=== STARTING TEST SERVER ===")
try:
    from flask import Flask, jsonify, request
    from flask_cors import CORS
    import logging
    import json
    
    # Set up detailed logging
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger(__name__)
    
    app = Flask(__name__)
    CORS(app)
    
    @app.route('/debug', methods=['GET'])
    def debug_route():
        """Test endpoint that returns env info"""
        try:
            env_info = {
                "python_version": platform.python_version(),
                "platform": platform.platform(),
                "flask_version": Flask.__version__,
                "env_vars": {k: v for k, v in os.environ.items() if not k.startswith("_")},
                "working_dir": os.getcwd()
            }
            return jsonify(env_info)
        except Exception as e:
            logger.error(f"Error in debug route: {str(e)}")
            logger.error(traceback.format_exc())
            return jsonify({"error": str(e), "traceback": traceback.format_exc()}), 500
    
    print("Starting diagnostic server on http://localhost:5050/debug")
    print("Press Ctrl+C to stop")
    app.run(host='0.0.0.0', port=5050, debug=True)
    
except Exception as e:
    print(f"ERROR starting Flask server: {str(e)}")
    print("\nDetailed traceback:")
    traceback.print_exc() 