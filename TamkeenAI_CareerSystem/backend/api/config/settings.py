"""
Configuration settings for the TamkeenAI API.

This module contains various configuration parameters for the application,
including settings for security, API, database, file storage, email, and more.
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Application settings
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
JWT_EXPIRATION = os.getenv('JWT_EXPIRATION', '24')  # in hours
JWT_REFRESH_EXPIRATION = os.getenv('JWT_REFRESH_EXPIRATION', '30')  # in days

# API settings
API_URL_PREFIX = os.getenv('API_URL_PREFIX', '/api')
CORS_ORIGIN = os.getenv('CORS_ORIGIN', '*')
MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', '16777216'))  # 16MB

# Database settings
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///tamkeen.db')
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/tamkeen')

# File storage settings
UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'}
MAX_FILE_SIZE = int(os.getenv('MAX_FILE_SIZE', '10485760'))  # 10MB

# Email settings
MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
MAIL_PORT = int(os.getenv('MAIL_PORT', '587'))
MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
MAIL_USE_SSL = os.getenv('MAIL_USE_SSL', 'False').lower() == 'true'
MAIL_USERNAME = os.getenv('MAIL_USERNAME', '')
MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', '')
MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@tamkeen.ai')

# Third-party API keys
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
LINKEDIN_CLIENT_ID = os.getenv('LINKEDIN_CLIENT_ID', '')
LINKEDIN_CLIENT_SECRET = os.getenv('LINKEDIN_CLIENT_SECRET', '')

# Logging settings
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FILE = os.getenv('LOG_FILE', 'app.log')

# Cache settings
CACHE_TYPE = os.getenv('CACHE_TYPE', 'simple')
CACHE_DEFAULT_TIMEOUT = int(os.getenv('CACHE_DEFAULT_TIMEOUT', '300'))  # 5 minutes

# Rate limiting
RATELIMIT_DEFAULT = os.getenv('RATELIMIT_DEFAULT', '100/hour')
RATELIMIT_STORAGE_URL = os.getenv('RATELIMIT_STORAGE_URL', 'memory://')

# Feature flags
ENABLE_EMAIL_VERIFICATION = os.getenv('ENABLE_EMAIL_VERIFICATION', 'True').lower() == 'true'
ENABLE_PASSWORD_RESET = os.getenv('ENABLE_PASSWORD_RESET', 'True').lower() == 'true'
ENABLE_2FA = os.getenv('ENABLE_2FA', 'False').lower() == 'true'