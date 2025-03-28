"""
Environment variables for the API.
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API keys
DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY', '')

# JWT settings
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret')
JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRE_MINUTES', '60'))

# Database
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///tamkeen.db')

# Debug mode
DEBUG = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't')

# Environment
ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')

# CORS
CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# API rate limiting
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", 60))

# Security settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-for-jwt")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Database configuration
DB_USERNAME = os.getenv("DB_USERNAME", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "tamkeen_ai")
DATABASE_URL = f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# App configuration
DEBUG = os.getenv("DEBUG", "False") == "True"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# API rate limiting
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", 60))

# Security settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-for-jwt")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Added Hugging Face token
HF_TOKEN = os.getenv("HF_TOKEN") 