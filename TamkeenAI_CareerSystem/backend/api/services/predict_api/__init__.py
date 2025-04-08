"""
PredictAPI - A flexible API interface with fallback to mock data

This package provides a unified interface for API calls with automatic
fallback to mock data when API keys are not available or when API calls fail.
"""

from .deepseek_client import DeepSeekClient
from .predict_client import PredictClient
from .mock_provider import MockDataProvider

__all__ = ['DeepSeekClient', 'PredictClient', 'MockDataProvider'] 