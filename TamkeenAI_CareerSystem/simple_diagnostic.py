#!/usr/bin/env python3
"""
Simplified diagnostic backend that only returns 
basic information to identify the error.
"""
from flask import Flask, jsonify
from flask_cors import CORS
import sys
import os
import traceback
import platform

app = Flask(__name__)
CORS(app)

@app.route('/debug', methods=['GET'])
def debug():
    """Simplified debug endpoint with minimal dependencies"""
    try:
        # Only collect the most basic information
        info = {
            "status": "ok",
            "python_version": sys.version,
            "platform": platform.platform(),
            "working_dir": os.getcwd()
        }
        return jsonify(info)
    except Exception as e:
        error_info = {
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        # Print the error to console as well
        print("ERROR in /debug endpoint:")
        print(error_info["traceback"])
        return jsonify(error_info), 500

@app.route('/ping', methods=['GET'])
def ping():
    """Super simple endpoint that just returns success"""
    return jsonify({"message": "pong"})

if __name__ == "__main__":
    print("Starting simplified diagnostic server...")
    print("Test endpoints:")
    print("- http://localhost:5060/ping (simple test)")
    print("- http://localhost:5060/debug (detailed info)")
    
    try:
        app.run(host='0.0.0.0', port=5060, debug=True)
    except Exception as e:
        print(f"ERROR starting server: {e}")
        traceback.print_exc() 