import os
import time
import requests
import json
import random
import traceback
import logging
from typing import Dict, List, Any, Optional, Tuple
from ..config.env import HF_TOKEN
from ..config.language_models import ALTERNATIVE_MODELS, DEFAULT_MODEL, DEFAULT_MAX_NEW_TOKENS, DEFAULT_TEMPERATURE, DEFAULT_TOP_P, DEFAULT_DO_SAMPLE

logger = logging.getLogger(__name__)

class LanguageModelService:
    """Service for robust text generation with fallback strategies"""
    
    def __init__(self, api_token: Optional[str] = None):
        """
        Initialize the language model service
        
        Args:
            api_token: Optional Hugging Face API token. If not provided, will use the one from environment
        """
        self.api_token = api_token or HF_TOKEN or os.environ.get("HF_TOKEN")
        
        if not self.api_token:
            raise ValueError(
                "No Hugging Face API token found. Please provide a token or set the HF_TOKEN environment variable."
            )
        
        self.headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
    
    def get_alternative_model(self) -> Tuple[Optional[str], Optional[Dict[str, Any]]]:
        """
        Cycle through alternative models when primary model is unavailable
        
        Returns:
            Tuple of (model_name, response) or (None, None) if all alternatives fail
        """
        for model in ALTERNATIVE_MODELS:
            try:
                endpoint = f"https://api-inference.huggingface.co/models/{model}"
                model_name = model.split("/")[-1]
                logger.info(f"Trying alternative model: {model_name}")
                
                payload = {
                    "inputs": "Explain AI in simple terms",
                    "parameters": {
                        "max_new_tokens": 50,
                        "temperature": 0.7
                    }
                }
                
                response = requests.post(
                    endpoint,
                    headers=self.headers,
                    json=payload,
                    timeout=30
                )
                
                if response.status_code == 200:
                    return model, response.json()
                
            except Exception as e:
                logger.error(f"Alternative model {model} failed: {str(e)}")
        
        return None, None
    
    def generate_text(
        self,
        prompt: str,
        model_id: str = DEFAULT_MODEL,
        max_new_tokens: int = DEFAULT_MAX_NEW_TOKENS,
        temperature: float = DEFAULT_TEMPERATURE,
        top_p: float = DEFAULT_TOP_P,
        do_sample: bool = DEFAULT_DO_SAMPLE,
        max_retries: int = 3
    ) -> str:
        """
        Generate text using Hugging Face API with robust fallback strategies
        
        Args:
            prompt: Input text prompt
            model_id: Model ID to use
            max_new_tokens: Maximum number of tokens to generate
            temperature: Sampling temperature
            top_p: Top-p sampling parameter
            do_sample: Whether to use sampling
            max_retries: Maximum number of retry attempts
            
        Returns:
            Generated text
        """
        api_url = f"https://api-inference.huggingface.co/models/{model_id}"
        
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": max_new_tokens,
                "temperature": temperature,
                "top_p": top_p,
                "do_sample": do_sample
            }
        }
        
        for attempt in range(max_retries):
            try:
                logger.info(f"Attempt {attempt + 1}/{max_retries}: Generating response with {model_id}")
                
                response = requests.post(
                    api_url,
                    headers=self.headers,
                    json=payload,
                    timeout=60
                )
                
                # Successful response
                if response.status_code == 200:
                    result = response.json()
                    if isinstance(result, list) and result:
                        generated_text = result[0].get("generated_text", "")
                        return generated_text.strip()
                    return str(result)
                
                # Service Unavailable - Try Alternative
                elif response.status_code == 503:
                    logger.warning(f"Service Unavailable for {model_id}. Trying alternative models...")
                    alt_model, alt_result = self.get_alternative_model()
                    
                    if alt_model and alt_result:
                        logger.info(f"Successfully used alternative model: {alt_model}")
                        if isinstance(alt_result, list) and alt_result:
                            return alt_result[0].get("generated_text", "Alternative generation failed")
                        return str(alt_result)
                    
                    # Wait and retry
                    wait_time = (2 ** attempt) + random.random()
                    logger.info(f"Waiting {wait_time:.2f} seconds before retry")
                    time.sleep(wait_time)
                
                else:
                    logger.error(f"API Error: {response.status_code} - {response.text}")
                    
                    # If we've reached the last retry, try alternative models
                    if attempt == max_retries - 1:
                        logger.warning("Trying alternative models as last resort...")
                        alt_model, alt_result = self.get_alternative_model()
                        
                        if alt_model and alt_result:
                            logger.info(f"Successfully used alternative model: {alt_model}")
                            if isinstance(alt_result, list) and alt_result:
                                return alt_result[0].get("generated_text", "Alternative generation failed")
                            return str(alt_result)
                    
                    # Not the last retry yet, wait and retry
                    wait_time = (2 ** attempt) + random.random()
                    logger.info(f"Waiting {wait_time:.2f} seconds before retry")
                    time.sleep(wait_time)
            
            except Exception as e:
                logger.error(f"Generation Error: {str(e)}")
                logger.debug(traceback.format_exc())
                
                # Try alternative models on exception
                alt_model, alt_result = self.get_alternative_model()
                if alt_model and alt_result:
                    logger.info(f"Successfully used alternative model: {alt_model}")
                    if isinstance(alt_result, list) and alt_result:
                        return alt_result[0].get("generated_text", "Alternative generation failed")
                    return str(alt_result)
                
                # Not the last retry yet, wait and retry
                if attempt < max_retries - 1:
                    wait_time = (2 ** attempt) + random.random()
                    logger.info(f"Waiting {wait_time:.2f} seconds before retry")
                    time.sleep(wait_time)
        
        return "Failed to generate response after multiple attempts" 