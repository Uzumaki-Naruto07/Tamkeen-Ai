"""
Central configuration settings for the Tamkeen AI Career Intelligence System.
Contains all constants, API keys, and configuration parameters.
"""

import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
TEMP_FOLDER = os.path.join(BASE_DIR, 'temp')
REPORT_FOLDER = os.path.join(BASE_DIR, 'reports')

# Ensure directories exist
for directory in [UPLOAD_FOLDER, TEMP_FOLDER, REPORT_FOLDER]:
    os.makedirs(directory, exist_ok=True)

# File settings
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload size
ALLOWED_EXTENSIONS = {
    'pdf', 'docx', 'doc', 'txt', 'rtf',  # Resume formats
    'jpg', 'jpeg', 'png',                 # Image formats for profile pictures
    'mp3', 'wav'                          # Audio formats for voice analysis
}

# NLP and AI model settings
NLP_MODEL = "en_core_web_sm"    # Default spaCy model
BERT_MODEL = "bert-base-uncased" # Default BERT model
USE_GPU = False                  # Whether to use GPU for model inference

# API Keys (use environment variables in production)
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
HUGGINGFACE_API_KEY = os.environ.get('HUGGINGFACE_API_KEY', '')
DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY', '')

# Feature flags - enable/disable components
ENABLE_TTS = True                # Text-to-speech features
ENABLE_SPEECH_RECOGNITION = True # Voice input features
ENABLE_EMOTION_DETECTION = True  # Facial emotion analysis
ENABLE_VOICE_EMOTION = True      # Voice emotion analysis
ENABLE_GAMIFICATION = True       # XP and badge system

# Career assessment settings
CAREER_READINESS_THRESHOLD = 70  # Minimum score for career readiness
SKILL_MATCH_THRESHOLD = 60       # Minimum score for skill match

# ATS Matcher settings
ATS_SIMILARITY_WEIGHT = 0.6      # Weight for document similarity in ATS score
ATS_KEYWORD_WEIGHT = 0.4         # Weight for keyword matching in ATS score

# User info settings
DEFAULT_LANGUAGE = 'en'          # Default interface language

# Visualization settings
DEFAULT_CHART_COLORS = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6']
MAX_CHART_ITEMS = 10             # Maximum items to show in charts

# Database configuration (if using a database)
DATABASE_URI = os.environ.get('DATABASE_URI', 'sqlite:///tamkeen_ai.db')

# Flask server settings
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-change-in-production')
PORT = int(os.environ.get('PORT', 5000))
