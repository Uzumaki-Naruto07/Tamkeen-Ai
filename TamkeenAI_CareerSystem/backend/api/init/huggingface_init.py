from ..utils.huggingface_utils import setup_huggingface_api
import logging

logger = logging.getLogger(__name__)

def initialize_huggingface():
    """Initialize Hugging Face API on application startup"""
    try:
        api_token = setup_huggingface_api()
        logger.info("Hugging Face API setup successful")
        return api_token
    except Exception as e:
        logger.error(f"Error setting up Hugging Face API: {e}")
        logger.warning("Some AI features may not work without Hugging Face API")
        return None 