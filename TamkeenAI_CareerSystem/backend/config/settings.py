"""
Settings Module

This module defines the configuration settings for the Tamkeen AI Career Intelligence System.
Configurations can be overridden by environment variables or environment-specific settings files.
"""

import os
import logging
from datetime import timedelta

# ------------------------------------------------------------------------------
# Environment and Basic Application Settings
# ------------------------------------------------------------------------------

# Determine environment (development, testing, production)
ENV = os.environ.get("TAMKEEN_ENV", "development")

# Basic application information
APP_NAME = "Tamkeen AI Career Intelligence System"
APP_VERSION = "1.0.0"
DEBUG = ENV == "development"
TESTING = ENV == "testing"

# API settings
API_PREFIX = "/api/v1"
API_RATE_LIMIT = os.environ.get("API_RATE_LIMIT", "200 per minute")

# Host and port settings
HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", 5000))

# ------------------------------------------------------------------------------
# Security Settings
# ------------------------------------------------------------------------------

# Secret keys (should be overridden in production by environment variables)
SECRET_KEY = os.environ.get("SECRET_KEY", "tamkeen-dev-secret-key-change-in-production")
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "tamkeen-jwt-dev-key-change-in-production")

# JWT settings
JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
JWT_TOKEN_LOCATION = ["headers"]
JWT_HEADER_NAME = "Authorization"
JWT_HEADER_TYPE = "Bearer"

# CORS settings
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")
CORS_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
CORS_ALLOW_HEADERS = ["Content-Type", "Authorization"]

# Password policy
PASSWORD_MIN_LENGTH = 8
PASSWORD_REQUIRE_UPPERCASE = True
PASSWORD_REQUIRE_LOWERCASE = True
PASSWORD_REQUIRE_DIGITS = True
PASSWORD_REQUIRE_SPECIAL = True

# ------------------------------------------------------------------------------
# Database Settings
# ------------------------------------------------------------------------------

# Database type: sqlite, mysql, postgresql, mongodb
DB_TYPE = os.environ.get("DB_TYPE", "sqlite")

# Database configurations for different types
DB_CONFIG = {
    "sqlite": {
        "path": os.environ.get("SQLITE_PATH", "data/tamkeen.db")
    },
    "mysql": {
        "host": os.environ.get("MYSQL_HOST", "localhost"),
        "port": int(os.environ.get("MYSQL_PORT", 3306)),
        "user": os.environ.get("MYSQL_USER", "tamkeen"),
        "password": os.environ.get("MYSQL_PASSWORD", "tamkeen"),
        "database": os.environ.get("MYSQL_DATABASE", "tamkeen"),
        "charset": os.environ.get("MYSQL_CHARSET", "utf8mb4")
    },
    "postgresql": {
        "host": os.environ.get("POSTGRES_HOST", "localhost"),
        "port": int(os.environ.get("POSTGRES_PORT", 5432)),
        "user": os.environ.get("POSTGRES_USER", "tamkeen"),
        "password": os.environ.get("POSTGRES_PASSWORD", "tamkeen"),
        "database": os.environ.get("POSTGRES_DATABASE", "tamkeen"),
        "sslmode": os.environ.get("POSTGRES_SSL_MODE", "prefer")
    },
    "mongodb": {
        "uri": os.environ.get("MONGO_URI", "mongodb://localhost:27017/tamkeen"),
        "db_name": os.environ.get("MONGO_DB_NAME", "tamkeen"),
        "auth_source": os.environ.get("MONGO_AUTH_SOURCE", "admin"),
        "connect_timeout_ms": int(os.environ.get("MONGO_CONNECT_TIMEOUT_MS", 30000))
    }
}

# Connection pool settings
DB_POOL_SIZE = int(os.environ.get("DB_POOL_SIZE", 5))
DB_MAX_OVERFLOW = int(os.environ.get("DB_MAX_OVERFLOW", 10))
DB_POOL_TIMEOUT = int(os.environ.get("DB_POOL_TIMEOUT", 30))
DB_POOL_RECYCLE = int(os.environ.get("DB_POOL_RECYCLE", 3600))

# ------------------------------------------------------------------------------
# File Upload Settings
# ------------------------------------------------------------------------------

# Upload paths and limits
UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER", os.path.join(os.getcwd(), "uploads"))
MAX_CONTENT_LENGTH = int(os.environ.get("MAX_CONTENT_LENGTH", 16 * 1024 * 1024))  # 16 MB default

# Allowed file extensions by type
ALLOWED_EXTENSIONS = {
    "resume": {"pdf", "doc", "docx", "txt", "rtf", "odt"},
    "image": {"png", "jpg", "jpeg", "gif", "webp"},
    "document": {"pdf", "doc", "docx", "txt", "rtf", "odt", "xlsx", "xls", "pptx", "ppt"}
}

# File storage configuration
STORAGE_TYPE = os.environ.get("STORAGE_TYPE", "local")  # local, s3, azure
STORAGE_CONFIG = {
    "s3": {
        "bucket": os.environ.get("S3_BUCKET", "tamkeen-uploads"),
        "region": os.environ.get("S3_REGION", "us-east-1"),
        "access_key": os.environ.get("S3_ACCESS_KEY", ""),
        "secret_key": os.environ.get("S3_SECRET_KEY", ""),
        "endpoint_url": os.environ.get("S3_ENDPOINT_URL", None)
    },
    "azure": {
        "connection_string": os.environ.get("AZURE_STORAGE_CONNECTION_STRING", ""),
        "container": os.environ.get("AZURE_STORAGE_CONTAINER", "tamkeen-uploads")
    }
}

# ------------------------------------------------------------------------------
# AI Model Settings
# ------------------------------------------------------------------------------

# AI models configuration
AI_CONFIG = {
    "use_nlp": os.environ.get("USE_NLP", "True").lower() in ["true", "1", "yes", "t"],
    "use_ml": os.environ.get("USE_ML", "True").lower() in ["true", "1", "yes", "t"],
    "models_path": os.environ.get("MODELS_PATH", os.path.join(os.getcwd(), "models")),
    "language_models": ["en", "ar", "fr"],
    "similarity_threshold": float(os.environ.get("SIMILARITY_THRESHOLD", 0.75)),
    "max_tokens": int(os.environ.get("MAX_TOKENS", 2048)),
    "skill_extraction_confidence": float(os.environ.get("SKILL_EXTRACTION_CONFIDENCE", 0.7)),
    "skill_embedding_dimension": int(os.environ.get("SKILL_EMBEDDING_DIMENSION", 100))
}

# NLP libraries availability
try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False

try:
    import nltk
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False

# ------------------------------------------------------------------------------
# Logging Configuration
# ------------------------------------------------------------------------------

# Log levels and directories
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
LOG_DIR = os.environ.get("LOG_DIR", "logs")
os.makedirs(LOG_DIR, exist_ok=True)

# Log file paths
LOG_FILE = os.path.join(LOG_DIR, "tamkeen.log")
ERROR_LOG_FILE = os.path.join(LOG_DIR, "error.log")
ACCESS_LOG_FILE = os.path.join(LOG_DIR, "access.log")

# Logging configuration dictionary
LOG_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "[%(asctime)s] %(levelname)s in %(module)s: %(message)s",
        },
        "detailed": {
            "format": "%(asctime)s | %(levelname)s | %(name)s | %(module)s | %(funcName)s:%(lineno)d | %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
        "access": {
            "format": "%(asctime)s | %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "level": "INFO",
            "formatter": "default",
            "stream": "ext://sys.stdout",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "level": LOG_LEVEL,
            "formatter": "detailed",
            "filename": LOG_FILE,
            "maxBytes": 10485760,  # 10 MB
            "backupCount": 5,
            "encoding": "utf8",
        },
        "error_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "level": "ERROR",
            "formatter": "detailed",
            "filename": ERROR_LOG_FILE,
            "maxBytes": 10485760,  # 10 MB
            "backupCount": 5,
            "encoding": "utf8",
        },
        "access_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "level": "INFO",
            "formatter": "access",
            "filename": ACCESS_LOG_FILE,
            "maxBytes": 10485760,  # 10 MB
            "backupCount": 5,
            "encoding": "utf8",
        }
    },
    "loggers": {
        "": {  # Root logger
            "level": LOG_LEVEL,
            "handlers": ["console", "file", "error_file"],
            "propagate": True,
        },
        "tamkeen": {
            "level": LOG_LEVEL,
            "handlers": ["console", "file", "error_file"],
            "propagate": False,
        },
        "tamkeen.api": {
            "level": LOG_LEVEL,
            "handlers": ["console", "file", "error_file"],
            "propagate": False,
        },
        "tamkeen.database": {
            "level": LOG_LEVEL,
            "handlers": ["file", "error_file"],
            "propagate": False,
        },
        "tamkeen.access": {
            "level": "INFO",
            "handlers": ["access_file"],
            "propagate": False,
        }
    }
}

# ------------------------------------------------------------------------------
# Feature Flags
# ------------------------------------------------------------------------------

# Feature toggles
FEATURES = {
    "job_recommendations": os.environ.get("FEATURE_JOB_RECOMMENDATIONS", "True").lower() in ["true", "1", "yes", "t"],
    "career_assessments": os.environ.get("FEATURE_CAREER_ASSESSMENTS", "True").lower() in ["true", "1", "yes", "t"],
    "resume_parsing": os.environ.get("FEATURE_RESUME_PARSING", "True").lower() in ["true", "1", "yes", "t"],
    "skills_gap_analysis": os.environ.get("FEATURE_SKILLS_GAP_ANALYSIS", "True").lower() in ["true", "1", "yes", "t"],
    "multilingual_support": os.environ.get("FEATURE_MULTILINGUAL", "True").lower() in ["true", "1", "yes", "t"],
    "job_market_insights": os.environ.get("FEATURE_JOB_MARKET_INSIGHTS", "True").lower() in ["true", "1", "yes", "t"],
    "ai_interview_prep": os.environ.get("FEATURE_AI_INTERVIEW_PREP", "False").lower() in ["true", "1", "yes", "t"],
    "resume_builder": os.environ.get("FEATURE_RESUME_BUILDER", "False").lower() in ["true", "1", "yes", "t"],
    "mentor_matching": os.environ.get("FEATURE_MENTOR_MATCHING", "False").lower() in ["true", "1", "yes", "t"]
}

# ------------------------------------------------------------------------------
# External APIs
# ------------------------------------------------------------------------------

# Job market API settings
JOB_MARKET_API = {
    "enabled": os.environ.get("JOB_MARKET_API_ENABLED", "False").lower() in ["true", "1", "yes", "t"],
    "url": os.environ.get("JOB_MARKET_API_URL", ""),
    "api_key": os.environ.get("JOB_MARKET_API_KEY", ""),
    "timeout": int(os.environ.get("JOB_MARKET_API_TIMEOUT", 30)),
    "cache_ttl": int(os.environ.get("JOB_MARKET_API_CACHE_TTL", 3600))  # Cache for 1 hour
}

# Skills API settings
SKILLS_API = {
    "enabled": os.environ.get("SKILLS_API_ENABLED", "False").lower() in ["true", "1", "yes", "t"],
    "url": os.environ.get("SKILLS_API_URL", ""),
    "api_key": os.environ.get("SKILLS_API_KEY", ""),
    "timeout": int(os.environ.get("SKILLS_API_TIMEOUT", 30)),
    "cache_ttl": int(os.environ.get("SKILLS_API_CACHE_TTL", 86400))  # Cache for 1 day
}

# ------------------------------------------------------------------------------
# Email Settings
# ------------------------------------------------------------------------------

# Email configuration
EMAIL_CONFIG = {
    "enabled": os.environ.get("EMAIL_ENABLED", "False").lower() in ["true", "1", "yes", "t"],
    "smtp_server": os.environ.get("SMTP_SERVER", "smtp.example.com"),
    "smtp_port": int(os.environ.get("SMTP_PORT", 587)),
    "smtp_user": os.environ.get("SMTP_USER", ""),
    "smtp_password": os.environ.get("SMTP_PASSWORD", ""),
    "from_email": os.environ.get("FROM_EMAIL", "noreply@tamkeen.ai"),
    "from_name": os.environ.get("FROM_NAME", "Tamkeen AI"),
    "use_tls": os.environ.get("SMTP_USE_TLS", "True").lower() in ["true", "1", "yes", "t"],
    "use_ssl": os.environ.get("SMTP_USE_SSL", "False").lower() in ["true", "1", "yes", "t"],
    "template_dir": os.environ.get("EMAIL_TEMPLATE_DIR", os.path.join(os.getcwd(), "templates/email"))
}

# ------------------------------------------------------------------------------
# Caching Settings
# ------------------------------------------------------------------------------

# Cache configuration
CACHE_TYPE = os.environ.get("CACHE_TYPE", "simple")  # simple, redis, memcached
CACHE_DEFAULT_TIMEOUT = int(os.environ.get("CACHE_DEFAULT_TIMEOUT", 300))  # 5 minutes

# Redis cache configuration
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
REDIS_PORT = int(os.environ.get("REDIS_PORT", 6379))
REDIS_DB = int(os.environ.get("REDIS_DB", 0))
REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD", None)

# ------------------------------------------------------------------------------
# Load environment-specific settings
# ------------------------------------------------------------------------------

# Load settings based on environment
env_settings_file = os.path.join(os.path.dirname(__file__), f"{ENV}_settings.py")
if os.path.exists(env_settings_file):
    with open(env_settings_file) as f:
        exec(f.read())
