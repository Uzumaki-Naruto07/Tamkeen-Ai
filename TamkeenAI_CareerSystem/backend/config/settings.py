"""
Settings Module

This module provides configuration settings for the Tamkeen AI Career Intelligence System.
"""

import os
import json
import logging
from typing import Dict, List, Any, Optional, Tuple, Union
from pathlib import Path
from datetime import timedelta

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_DIR = os.path.join(BASE_DIR, "models")
TEMP_DIR = os.path.join(BASE_DIR, "temp")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

# Create directories if they don't exist
for directory in [DATA_DIR, MODEL_DIR, TEMP_DIR, UPLOAD_DIR]:
    os.makedirs(directory, exist_ok=True)

# Environment
ENV = os.environ.get("TAMKEEN_ENV", "development")
DEBUG = ENV == "development"

# Application
APP_NAME = "Tamkeen AI Career Intelligence System"
APP_VERSION = "1.0.0"
API_VERSION = "v1"
API_PREFIX = f"/api/{API_VERSION}"

# Server
HOST = os.environ.get("TAMKEEN_HOST", "0.0.0.0")
PORT = int(os.environ.get("TAMKEEN_PORT", 5000))

# Security
SECRET_KEY = os.environ.get("TAMKEEN_SECRET_KEY", "tamkeen-dev-secret-key")
JWT_SECRET_KEY = os.environ.get("TAMKEEN_JWT_SECRET_KEY", SECRET_KEY)
JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
PASSWORD_MIN_LENGTH = 8
PASSWORD_REQUIRE_UPPERCASE = True
PASSWORD_REQUIRE_LOWERCASE = True
PASSWORD_REQUIRE_DIGITS = True
PASSWORD_REQUIRE_SPECIAL = True

# Database
DB_TYPE = os.environ.get("TAMKEEN_DB_TYPE", "sqlite")
DB_CONFIG = {
    "sqlite": {
        "db_file": os.environ.get("TAMKEEN_SQLITE_FILE", os.path.join(DATA_DIR, "tamkeen.db"))
    },
    "mysql": {
        "host": os.environ.get("TAMKEEN_MYSQL_HOST", "localhost"),
        "port": int(os.environ.get("TAMKEEN_MYSQL_PORT", 3306)),
        "user": os.environ.get("TAMKEEN_MYSQL_USER", "tamkeen"),
        "password": os.environ.get("TAMKEEN_MYSQL_PASSWORD", "tamkeen"),
        "database": os.environ.get("TAMKEEN_MYSQL_DATABASE", "tamkeen")
    },
    "postgresql": {
        "host": os.environ.get("TAMKEEN_PG_HOST", "localhost"),
        "port": int(os.environ.get("TAMKEEN_PG_PORT", 5432)),
        "user": os.environ.get("TAMKEEN_PG_USER", "tamkeen"),
        "password": os.environ.get("TAMKEEN_PG_PASSWORD", "tamkeen"),
        "database": os.environ.get("TAMKEEN_PG_DATABASE", "tamkeen")
    },
    "mongodb": {
        "uri": os.environ.get("TAMKEEN_MONGO_URI", "mongodb://localhost:27017"),
        "database": os.environ.get("TAMKEEN_MONGO_DATABASE", "tamkeen")
    }
}

# External APIs
EXTERNAL_APIS = {
    "job_market": {
        "enabled": os.environ.get("TAMKEEN_JOB_MARKET_API_ENABLED", "0") == "1",
        "url": os.environ.get("TAMKEEN_JOB_MARKET_API_URL", ""),
        "key": os.environ.get("TAMKEEN_JOB_MARKET_API_KEY", "")
    },
    "skills": {
        "enabled": os.environ.get("TAMKEEN_SKILLS_API_ENABLED", "0") == "1",
        "url": os.environ.get("TAMKEEN_SKILLS_API_URL", ""),
        "key": os.environ.get("TAMKEEN_SKILLS_API_KEY", "")
    },
    "learning": {
        "enabled": os.environ.get("TAMKEEN_LEARNING_API_ENABLED", "0") == "1",
        "url": os.environ.get("TAMKEEN_LEARNING_API_URL", ""),
        "key": os.environ.get("TAMKEEN_LEARNING_API_KEY", "")
    }
}

# Feature flags
FEATURES = {
    "job_market_insights": os.environ.get("TAMKEEN_FEATURE_JOB_MARKET", "1") == "1",
    "resume_parsing": os.environ.get("TAMKEEN_FEATURE_RESUME_PARSING", "1") == "1",
    "job_matching": os.environ.get("TAMKEEN_FEATURE_JOB_MATCHING", "1") == "1",
    "career_planning": os.environ.get("TAMKEEN_FEATURE_CAREER_PLANNING", "1") == "1",
    "learning_recommendations": os.environ.get("TAMKEEN_FEATURE_LEARNING", "1") == "1",
    "email_notifications": os.environ.get("TAMKEEN_FEATURE_EMAIL", "1") == "1"
}

# Email settings
EMAIL_CONFIG = {
    "enabled": FEATURES.get("email_notifications", False),
    "server": os.environ.get("TAMKEEN_EMAIL_SERVER", ""),
    "port": int(os.environ.get("TAMKEEN_EMAIL_PORT", 587)),
    "username": os.environ.get("TAMKEEN_EMAIL_USERNAME", ""),
    "password": os.environ.get("TAMKEEN_EMAIL_PASSWORD", ""),
    "use_tls": os.environ.get("TAMKEEN_EMAIL_TLS", "1") == "1",
    "from_email": os.environ.get("TAMKEEN_EMAIL_FROM", "noreply@tamkeen.ai"),
    "from_name": os.environ.get("TAMKEEN_EMAIL_FROM_NAME", "Tamkeen AI")
}

# Model paths
MODEL_PATHS = {
    "nlp": os.path.join(MODEL_DIR, "nlp"),
    "skills": os.path.join(MODEL_DIR, "skills"),
    "matching": os.path.join(MODEL_DIR, "matching"),
    "data": os.path.join(DATA_DIR, "reference")
}

# Resume parser configuration
PARSER_CONFIG = {
    "use_spacy": True,
    "min_skill_confidence": 0.7,
    "supported_file_types": ["pdf", "docx", "txt", "rtf", "odt"],
    "max_file_size_mb": 10,
    "extract_contact_info": True,
    "extract_education": True,
    "extract_experience": True,
    "extract_skills": True,
    "extract_projects": True,
    "extract_certifications": True,
    "extract_languages": True
}

# Job matching configuration
MATCHING_CONFIG = {
    "skill_weight": 0.5,
    "education_weight": 0.15,
    "experience_weight": 0.25,
    "location_weight": 0.1,
    "min_match_score": 0.6,
    "use_semantic_matching": True,
    "consider_skill_level": True,
    "consider_recency": True
}

# Job recommender configuration
RECOMMENDER_CONFIG = {
    "weights": {
        "skill_match": 0.4,
        "experience_match": 0.15,
        "education_match": 0.1,
        "location_match": 0.15,
        "industry_match": 0.1,
        "user_behavior": 0.1
    },
    "similarity_threshold": 0.6,
    "max_collaborative_jobs": 1000,
    "career_paths_file": os.path.join(DATA_DIR, "reference", "career_paths.json"),
    "default_career_paths": [
        {
            "name": "Software Development",
            "jobs": [
                {"title": "Junior Developer", "level": "entry", "years": "0-2"},
                {"title": "Software Developer", "level": "mid", "years": "2-5"},
                {"title": "Senior Developer", "level": "senior", "years": "5-8"},
                {"title": "Tech Lead", "level": "senior", "years": "8-12"},
                {"title": "Software Architect", "level": "lead", "years": "10+"},
                {"title": "CTO", "level": "executive", "years": "15+"}
            ]
        },
        {
            "name": "Data Science",
            "jobs": [
                {"title": "Data Analyst", "level": "entry", "years": "0-2"},
                {"title": "Junior Data Scientist", "level": "junior", "years": "1-3"},
                {"title": "Data Scientist", "level": "mid", "years": "3-6"},
                {"title": "Senior Data Scientist", "level": "senior", "years": "6-10"},
                {"title": "Lead Data Scientist", "level": "lead", "years": "8+"},
                {"title": "Chief Data Officer", "level": "executive", "years": "15+"}
            ]
        }
    ]
}

# Load environment-specific settings
ENV_SETTINGS_FILE = os.path.join(BASE_DIR, "backend", "config", f"{ENV}.json")
if os.path.exists(ENV_SETTINGS_FILE):
    try:
        with open(ENV_SETTINGS_FILE, "r") as f:
            env_settings = json.load(f)
            
            # Update settings from environment file
            for key, value in env_settings.items():
                if isinstance(value, dict) and key in globals() and isinstance(globals()[key], dict):
                    # Merge dictionaries
                    globals()[key].update(value)
                else:
                    # Set value
                    globals()[key] = value
                    
        logger.info(f"Loaded environment settings from {ENV_SETTINGS_FILE}")
    except Exception as e:
        logger.error(f"Error loading environment settings: {str(e)}")
