from ..services.language_model_service import LanguageModelService
import logging

logger = logging.getLogger(__name__)

def initialize_language_model():
    """Initialize language model service and test it at startup"""
    try:
        lm_service = LanguageModelService()
        
        # Test the service with a simple prompt
        test_prompt = "Explain artificial intelligence in simple terms."
        response = lm_service.generate_text(
            prompt=test_prompt,
            max_new_tokens=100  # Short response for quick test
        )
        
        if response and len(response) > 20:  # Simple check that we got a reasonable response
            logger.info("Language model service initialized successfully")
            return lm_service
        else:
            logger.warning(f"Language model test returned short response: {response}")
            return lm_service
    
    except Exception as e:
        logger.error(f"Error initializing language model service: {e}")
        logger.warning("Language model features may not work correctly")
        return None 