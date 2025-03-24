"""
Central configuration settings for the Tamkeen AI Career Intelligence System.
Contains all constants, API keys, and configuration parameters.
"""

import os
from pathlib import Path
from typing import Dict, List, Any

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

# Data directory
DATA_DIR = os.path.join(BASE_DIR, 'data')
os.makedirs(DATA_DIR, exist_ok=True)

# Uploads directory
UPLOAD_FOLDER = os.path.join(DATA_DIR, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Reports directory
REPORT_FOLDER = os.path.join(DATA_DIR, 'reports')
os.makedirs(REPORT_FOLDER, exist_ok=True)

# Logging configuration
LOG_FOLDER = os.path.join(BASE_DIR, 'logs')
os.makedirs(LOG_FOLDER, exist_ok=True)

LOG_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
        },
    },
    'handlers': {
        'default': {
            'level': 'INFO',
            'formatter': 'standard',
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOG_FOLDER, 'tamkeen_ai.log'),
        },
        'console': {
            'level': 'INFO',
            'formatter': 'standard',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        '': {
            'handlers': ['default', 'console'],
            'level': 'INFO',
            'propagate': True
        },
    }
}

# API settings
API_VERSION = "v1"
API_PREFIX = f"/api/{API_VERSION}"

# Security settings
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'temporary-jwt-key-change-in-production')
JWT_ACCESS_TOKEN_EXPIRES = 60 * 60 * 24  # 24 hours
BCRYPT_LOG_ROUNDS = 13  # Number of rounds for password hashing

# Database settings
DB_TYPE = os.environ.get('DB_TYPE', 'sqlite')
DB_CONFIG = {
    'sqlite': {
        'path': os.path.join(BASE_DIR, 'data', 'tamkeen_ai.db')
    },
    'mysql': {
        'host': os.environ.get('MYSQL_HOST', 'localhost'),
        'port': int(os.environ.get('MYSQL_PORT', 3306)),
        'user': os.environ.get('MYSQL_USER', 'tamkeen'),
        'password': os.environ.get('MYSQL_PASSWORD', 'password'),
        'database': os.environ.get('MYSQL_DATABASE', 'tamkeen_ai')
    },
    'postgresql': {
        'host': os.environ.get('POSTGRES_HOST', 'localhost'),
        'port': int(os.environ.get('POSTGRES_PORT', 5432)),
        'user': os.environ.get('POSTGRES_USER', 'tamkeen'),
        'password': os.environ.get('POSTGRES_PASSWORD', 'password'),
        'database': os.environ.get('POSTGRES_DATABASE', 'tamkeen_ai')
    },
    'mongodb': {
        'host': os.environ.get('MONGO_HOST', 'localhost'),
        'port': int(os.environ.get('MONGO_PORT', 27017)),
        'user': os.environ.get('MONGO_USER', 'tamkeen'),
        'password': os.environ.get('MONGO_PASSWORD', 'password'),
        'database': os.environ.get('MONGO_DATABASE', 'tamkeen_ai')
    }
}

# Third-party API settings
LINKEDIN_API_KEY = os.environ.get('LINKEDIN_API_KEY', '')
GITHUB_API_KEY = os.environ.get('GITHUB_API_KEY', '')
GLASSDOOR_API_KEY = os.environ.get('GLASSDOOR_API_KEY', '')
INDEED_API_KEY = os.environ.get('INDEED_API_KEY', '')

# UI/UX settings
APP_NAME = "Tamkeen AI Career Intelligence System"
APP_DESCRIPTION = "Advanced career intelligence platform for personalized career guidance"
APP_VERSION = "1.0.0"
APP_CONTACT_EMAIL = "contact@tamkeen-ai.com"

# Email settings
EMAIL_CONFIG = {
    'smtp_server': os.environ.get('SMTP_SERVER', 'smtp.gmail.com'),
    'smtp_port': int(os.environ.get('SMTP_PORT', 587)),
    'smtp_user': os.environ.get('SMTP_USER', ''),
    'smtp_password': os.environ.get('SMTP_PASSWORD', ''),
    'from_email': os.environ.get('FROM_EMAIL', 'noreply@tamkeen-ai.com'),
    'use_tls': True
}

# Cache settings
CACHE_CONFIG = {
    'type': 'simple',  # 'simple', 'redis', 'memcached'
    'timeout': 300,  # 5 minutes default cache timeout
    'redis': {
        'host': os.environ.get('REDIS_HOST', 'localhost'),
        'port': int(os.environ.get('REDIS_PORT', 6379)),
        'db': int(os.environ.get('REDIS_DB', 0)),
        'password': os.environ.get('REDIS_PASSWORD', None)
    }
}

# System performance settings
THREADING_ENABLED = True
MAX_THREADS = 4
REQUEST_TIMEOUT = 30  # seconds
