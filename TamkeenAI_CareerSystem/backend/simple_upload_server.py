from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime
import json
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pdfplumber
# Removing problematic imports
# from sentence_transformers import SentenceTransformer
# from keybert import KeyBERT
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.tag import pos_tag
from nltk.stem import WordNetLemmatizer
from difflib import SequenceMatcher
import argparse

# Download NLTK resources
try:
    nltk.data.find('taggers/averaged_perceptron_tagger')
except LookupError:
    nltk.download('averaged_perceptron_tagger')

    nltk.download('punkt')
    nltk.download('stopwords')
nltk.download('wordnet')

# Initialize lemmatizer
lemmatizer = WordNetLemmatizer()

# Create a safe POS tagging function that handles errors
def safe_pos_tag(tokens):
    """POS tag tokens with fallback to basic tagging if nltk tagger fails"""
    try:
        # Use the standard tagger without any language suffix
        return pos_tag(tokens)
    except LookupError as e:
        print(f"POS tagger error: {e}")
        # Basic part-of-speech fallback - assume common words are nouns
        return [(word, "NN") for word in tokens]
    except Exception as e:
        print(f"Unexpected error in POS tagging: {e}")
        return [(word, "NN") for word in tokens]

# Function for fuzzy string matching
def fuzzy_match(a, b, threshold=0.85):
    """Calculate fuzzy match ratio between two strings"""
    if not a or not b:
        return 0
    return SequenceMatcher(None, a.lower(), b.lower()).ratio() >= threshold

# Function to check if a term is in text using lemmatization
def lemma_term_in_text(term, text):
    """Check if a term is in text, accounting for lemmatization"""
    if not term or not text:
        return False
        
    # Direct check first (faster)
    if term.lower() in text.lower():
        return True
        
    # For multi-word terms
    term_words = term.lower().split()
    text_words = text.lower().split()
    
    # Lemmatize everything
    lemma_term_words = [lemmatizer.lemmatize(word) for word in term_words]
    lemma_text_words = [lemmatizer.lemmatize(word) for word in text_words]
    
    # Check if all term words exist in text (lemmatized)
    if len(term_words) > 1:
        # For multi-word terms, check if all lemmatized words are present
        return all(any(fuzzy_match(tw, tw2, 0.9) for tw2 in lemma_text_words) for tw in lemma_term_words)
    else:
        # For single-word terms, direct lemmatized comparison
        return any(fuzzy_match(lemma_term_words[0], tw, 0.9) for tw in lemma_text_words)

def create_app():
    """Create and configure Flask application for gunicorn"""
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    # Set up upload folder
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    # Configure app with upload folder
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

    # Allowed file extensions
    ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'txt'}

    def allowed_file(filename):
        """Check if file extension is allowed"""
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    # Add CORS preflight handlers
    @app.route('/api/resume/upload', methods=['OPTIONS'])
    @app.route('/api/ats/analyze-with-deepseek', methods=['OPTIONS'])
    @app.route('/api/ats/analyze-with-openai', methods=['OPTIONS'])
    @app.route('/api/api/ats/analyze-with-deepseek', methods=['OPTIONS'])
    @app.route('/api/api/ats/analyze-with-openai', methods=['OPTIONS'])
    def handle_preflight():
        """Handle CORS preflight requests"""
        return '', 204

    @app.route('/api/health-check', methods=['GET'])
    def health_check():
        """Simple health check endpoint"""
        return jsonify({
            "status": "ok",
            "message": "Simple upload server is running",
            "time": datetime.now().isoformat()
        }), 200

    @app.route('/api/resume/upload', methods=['POST'])
    def upload_resume():
        """Simple resume upload endpoint"""
        print("Upload endpoint called!")
        print("Request headers:", request.headers.get('Host'))
        print("Request form data:", list(request.form.keys()))
        print("Request files:", list(request.files.keys()) if request.files else "No files")
        
        if 'file' not in request.files:
            print("Error: No file part in request")
            return jsonify({"error": "No file part"}), 400
            
        file = request.files['file']
        
        if file.filename == '':
            print("Error: Empty filename")
            return jsonify({"error": "No selected file"}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            # Check the file size after saving
            file_size = os.path.getsize(file_path)
            print(f"File received: {file.filename}, size: {file_size}")
            
            return jsonify({
                "success": True,
                "message": "File uploaded successfully",
                "filename": file.filename,
                "file_size": file_size,
                "upload_time": datetime.now().isoformat()
            }), 201
        else:
            return jsonify({"error": "File type not allowed"}), 400
    
    return app

# Create app instance for direct running
app = create_app()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Simple upload server')
    parser.add_argument('--port', type=int, default=5001, help='Port to run server on')
    args = parser.parse_args()
    
    print(f"Starting simple upload server on port {args.port}...")
    app.run(host='0.0.0.0', port=args.port, debug=True) 