"""
API utility functions for TamkeenAI.
"""

import logging
from datetime import datetime
from typing import Dict, Any, Tuple, List, Union

# Setup logger
logger = logging.getLogger(__name__)


def api_response(data=None, status_code=200, message=None, meta=None):
    """
    Generate a standardized API response.
    
    Args:
        data: Response data
        status_code: HTTP status code
        message: Response message
        meta: Additional metadata
        
    Returns:
        Tuple of (response_dict, status_code)
    """
    response = {
        "success": 200 <= status_code < 400,
        "timestamp": datetime.now().isoformat(),
        "data": data,
    }
    
    if message:
        response["message"] = message
        
    if meta:
        response["meta"] = meta
        
    return response, status_code


def error_response(message, status_code=400, errors=None):
    """
    Generate a standardized error response.
    
    Args:
        message: Error message
        status_code: HTTP status code
        errors: Detailed error information
        
    Returns:
        Tuple of (response_dict, status_code)
    """
    response = {
        "success": False,
        "timestamp": datetime.now().isoformat(),
        "message": message,
    }
    
    if errors:
        response["errors"] = errors
        
    return response, status_code


def parse_query_params(params, defaults=None):
    """
    Parse and validate query parameters.
    
    Args:
        params: Request args
        defaults: Default values
        
    Returns:
        Dict of parsed parameters
    """
    if defaults is None:
        defaults = {}
    
    result = {}
    
    # Add default values
    for key, value in defaults.items():
        result[key] = value
    
    # Override with provided values
    for key, value in params.items():
        # Skip None values
        if value is None:
            continue
        
        # Convert booleans
        if isinstance(value, str):
            if value.lower() in ('true', 'yes', '1'):
                result[key] = True
            elif value.lower() in ('false', 'no', '0'):
                result[key] = False
            # Convert integers
            elif value.isdigit():
                result[key] = int(value)
            # Convert floats
            elif value.replace('.', '', 1).isdigit() and value.count('.') < 2:
                result[key] = float(value)
            # Keep strings
            else:
                result[key] = value
        else:
            result[key] = value
    
    return result