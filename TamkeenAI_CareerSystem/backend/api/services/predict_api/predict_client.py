"""
PredictClient - A flexible client for API calls with mock data fallback

This module provides a unified interface for making API calls with automatic
fallback to mock data when API keys are unavailable or when API calls fail.
"""

import os
import logging
from typing import Dict, Any, List, Optional, Union, Callable
import json
import time

from .mock_provider import MockDataProvider

# Setup logger
logger = logging.getLogger(__name__)

class PredictClient:
    """
    A flexible client for API calls with automatic fallback to mock data.
    
    This client handles API calls to various providers and automatically
    falls back to mock data when API keys are not available or when calls fail.
    """
    
    def __init__(
        self, 
        api_key: Optional[str] = None,
        provider: str = 'deepseek',
        mock_data_enabled: Optional[bool] = None,
        mock_data_provider: Optional[MockDataProvider] = None,
        base_url: Optional[str] = None
    ):
        """
        Initialize the PredictClient.
        
        Args:
            api_key: API key for the provider (if None, will try to get from environment)
            provider: Provider name ('deepseek', 'openai', etc.)
            mock_data_enabled: Whether to enable mock data fallback (if None, determined by environment)
            mock_data_provider: Mock data provider instance (created if None)
            base_url: Base URL for API calls (provider-specific default if None)
        """
        self.provider = provider.lower()
        self.api_key = api_key or self._get_api_key_from_env()
        
        # Determine if mock data should be used
        if mock_data_enabled is None:
            self.mock_data_enabled = self._should_use_mock_data()
        else:
            self.mock_data_enabled = mock_data_enabled
            
        # Initialize mock data provider if needed
        self.mock_provider = mock_data_provider or MockDataProvider(provider=provider)
        
        # Set up provider-specific client
        self.api_client = self._initialize_api_client(base_url)
        
        # Track API usage metrics
        self.metrics = {
            'total_calls': 0,
            'successful_calls': 0,
            'failed_calls': 0,
            'mock_fallbacks': 0,
            'last_call_time': None,
            'total_tokens': 0
        }
        
        # Log initialization status
        if self.api_client:
            logger.info(f"PredictClient initialized with {provider} provider")
            if self.mock_data_enabled:
                logger.info(f"Mock data fallback is enabled")
        else:
            logger.warning(f"PredictClient initialized without API client, using mock data only")
    
    def _get_api_key_from_env(self) -> Optional[str]:
        """Get API key from environment variables based on provider."""
        env_vars = {
            'deepseek': ['DEEPSEEK_API_KEY'],
            'openai': ['OPENAI_API_KEY'],
            'huggingface': ['HF_API_KEY', 'HUGGINGFACE_API_KEY', 'HF_TOKEN']
        }
        
        provider_vars = env_vars.get(self.provider, [f"{self.provider.upper()}_API_KEY"])
        
        for var in provider_vars:
            api_key = os.environ.get(var)
            if api_key and api_key not in ('', 'your_api_key_here'):
                return api_key
                
        return None
    
    def _should_use_mock_data(self) -> bool:
        """Determine if mock data should be used based on environment."""
        # Check specific provider environment variable
        provider_mock = os.environ.get(f"USE_{self.provider.upper()}_MOCK")
        if provider_mock is not None:
            return provider_mock.lower() in ('true', '1', 't', 'yes')
            
        # Check general mock data environment variables
        use_mock = os.environ.get("USE_MOCK_DATA") or os.environ.get("ENABLE_MOCK_DATA")
        if use_mock is not None:
            return use_mock.lower() in ('true', '1', 't', 'yes')
            
        # Default to using mock if no API key available
        return self.api_key is None
    
    def _initialize_api_client(self, base_url: Optional[str] = None) -> Any:
        """Initialize the appropriate API client based on provider."""
        if not self.api_key and not self.mock_data_enabled:
            logger.warning(f"No API key for {self.provider} and mock data is disabled")
            return None
            
        if self.provider == 'deepseek':
            return self._initialize_deepseek_client(base_url)
        elif self.provider == 'openai':
            return self._initialize_openai_client(base_url)
        elif self.provider == 'huggingface':
            return self._initialize_huggingface_client(base_url)
        else:
            logger.warning(f"Unknown provider: {self.provider}, using mock data only")
            return None
    
    def _initialize_deepseek_client(self, base_url: Optional[str] = None) -> Any:
        """Initialize DeepSeek API client."""
        if not self.api_key and not self.mock_data_enabled:
            return None
            
        try:
            from openai import OpenAI
            return OpenAI(
                base_url=base_url or "https://openrouter.ai/api/v1",
                api_key=self.api_key or "mock_key_for_initialization"
            )
        except ImportError:
            logger.warning("OpenAI package not installed, DeepSeek client unavailable")
            return None
        except Exception as e:
            logger.error(f"Error initializing DeepSeek client: {str(e)}")
            return None
    
    def _initialize_openai_client(self, base_url: Optional[str] = None) -> Any:
        """Initialize OpenAI API client."""
        if not self.api_key and not self.mock_data_enabled:
            return None
            
        try:
            from openai import OpenAI
            return OpenAI(
                base_url=base_url or "https://api.openai.com/v1",
                api_key=self.api_key or "mock_key_for_initialization"
            )
        except ImportError:
            logger.warning("OpenAI package not installed, OpenAI client unavailable")
            return None
        except Exception as e:
            logger.error(f"Error initializing OpenAI client: {str(e)}")
            return None
    
    def _initialize_huggingface_client(self, base_url: Optional[str] = None) -> Any:
        """Initialize HuggingFace API client."""
        # For simplicity, we're not implementing HuggingFace client here
        logger.warning("HuggingFace client not implemented")
        return None
    
    def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        mock_endpoint: str = 'chat',
        **kwargs
    ) -> Dict[str, Any]:
        """
        Get chat completion from API with mock fallback.
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            model: Model name to use (provider-specific default if None)
            temperature: Temperature parameter for generation
            max_tokens: Maximum tokens to generate
            mock_endpoint: Mock endpoint to use for fallback
            **kwargs: Additional provider-specific parameters
            
        Returns:
            Dictionary with response data
        """
        self.metrics['total_calls'] += 1
        self.metrics['last_call_time'] = time.time()
        
        # Set provider-specific default model if not specified
        if model is None:
            model = self._get_default_model()
        
        # Try to use API client if available
        if self.api_client and not self.mock_data_enabled:
            try:
                if self.provider in ('deepseek', 'openai'):
                    response = self.api_client.chat.completions.create(
                        model=model,
                        messages=messages,
                        temperature=temperature,
                        max_tokens=max_tokens,
                        **kwargs
                    )
                    
                    self.metrics['successful_calls'] += 1
                    # Estimate token usage (rough approximation)
                    self.metrics['total_tokens'] += max_tokens
                    
                    # Format response for consistent structure
                    return {
                        'content': response.choices[0].message.content,
                        'model': model,
                        'provider': self.provider,
                        'api_used': True,
                        'mock_used': False,
                        'success': True
                    }
                else:
                    logger.warning(f"Chat completion not implemented for {self.provider}")
            except Exception as e:
                logger.error(f"Error in chat completion API call: {str(e)}")
                self.metrics['failed_calls'] += 1
                
                # Fall back to mock data if enabled
                if self.mock_data_enabled:
                    logger.info(f"Falling back to mock data for chat completion")
                else:
                    return {
                        'error': str(e),
                        'api_used': True,
                        'mock_used': False,
                        'success': False
                    }
        
        # Use mock data if API unavailable or mock explicitly enabled
        if self.mock_data_enabled:
            self.metrics['mock_fallbacks'] += 1
            mock_response = self.mock_provider.get_mock_response(
                endpoint=mock_endpoint,
                data={
                    'messages': messages,
                    'model': model,
                    'temperature': temperature,
                    'max_tokens': max_tokens
                }
            )
            
            return {
                **mock_response,
                'api_used': False,
                'mock_used': True,
                'success': True
            }
        
        # If we get here, both API and mock failed
        return {
            'error': 'Failed to get completion from API and mock data is disabled',
            'api_used': False,
            'mock_used': False,
            'success': False
        }
    
    def _get_default_model(self) -> str:
        """Get default model based on provider."""
        defaults = {
            'deepseek': 'deepseek/deepseek-chat',
            'openai': 'gpt-3.5-turbo',
            'huggingface': 'mistralai/mixtral-8x7b-instruct-v0.1'
        }
        return defaults.get(self.provider, 'default-model')
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get API usage metrics."""
        return self.metrics
    
    def is_using_mock(self) -> bool:
        """Check if the client is using mock data."""
        return self.mock_data_enabled or not self.api_client
    
    def toggle_mock_mode(self, enabled: bool) -> None:
        """Toggle mock data mode."""
        self.mock_data_enabled = enabled
        logger.info(f"Mock data mode {'enabled' if enabled else 'disabled'}")
    
    def test_connection(self) -> Dict[str, Any]:
        """Test connection to the API provider."""
        try:
            if not self.api_client:
                return {
                    'connected': False,
                    'message': f"No {self.provider} client initialized",
                    'using_mock': self.mock_data_enabled
                }
                
            if self.provider in ('deepseek', 'openai'):
                # Simple test prompt
                response = self.api_client.chat.completions.create(
                    model=self._get_default_model(),
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant."},
                        {"role": "user", "content": f"Say '{self.provider} connection successful!'"}
                    ],
                    max_tokens=20
                )
                
                return {
                    'connected': True,
                    'message': response.choices[0].message.content,
                    'using_mock': False
                }
            else:
                return {
                    'connected': False,
                    'message': f"Test connection not implemented for {self.provider}",
                    'using_mock': self.mock_data_enabled
                }
        except Exception as e:
            logger.error(f"Error testing connection to {self.provider}: {str(e)}")
            return {
                'connected': False,
                'error': str(e),
                'message': f"Failed to connect to {self.provider}",
                'using_mock': self.mock_data_enabled
            } 