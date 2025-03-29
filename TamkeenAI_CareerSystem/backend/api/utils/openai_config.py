"""
OpenAI Configuration Utility

This module provides a centralized configuration for OpenAI client
to ensure consistent initialization across the application.
"""

import os
import logging
import pkg_resources

logger = logging.getLogger(__name__)

# Global client to be reused throughout the application
openai_client = None

def get_openai_client():
    """
    Get the OpenAI client instance.
    
    Returns:
        The OpenAI client instance or None if it couldn't be initialized.
    """
    global openai_client
    
    # Return existing client if already initialized
    if openai_client is not None:
        return openai_client
    
    try:
        # Check for API key
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key or api_key == 'your_openai_api_key_here':
            logger.warning("OPENAI_API_KEY environment variable not set or contains placeholder value.")
            return None
        
        # Use a direct approach to avoid compatibility issues
        try:
            # Try the newer OpenAI client (1.x) approach
            from openai import OpenAI
            # Explicitly pass only the api_key to avoid any unexpected parameters
            openai_client = OpenAI(api_key=api_key)
            logger.info(f"OpenAI client (v1+) initialized successfully")
        except (ImportError, TypeError):
            # Fall back to older OpenAI interface
            try:
                import openai
                openai.api_key = api_key
                openai_client = openai
                logger.info(f"OpenAI client (v0.x) initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize older OpenAI client: {str(e)}")
                return None
        
        return openai_client
        
    except Exception as e:
        logger.error(f"Failed to initialize OpenAI client: {str(e)}")
        return None 