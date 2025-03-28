"""
Configuration modules for the API.
"""

# Config package
from .env import (
    DEEPSEEK_API_KEY, 
    JWT_SECRET_KEY, 
    JWT_ALGORITHM,
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES,
    DATABASE_URL,
    DEBUG,
    ENVIRONMENT,
    CORS_ORIGINS
) 