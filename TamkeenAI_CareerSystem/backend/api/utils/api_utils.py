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


def validate_request(request_data, required_fields=None, optional_fields=None):
    """
    Validate request data against required and optional fields.
    
    Args:
        request_data: Request data to validate
        required_fields: List of required field names
        optional_fields: List of optional field names
        
    Returns:
        Tuple of (is_valid, errors, validated_data)
    """
    if required_fields is None:
        required_fields = []
    
    if optional_fields is None:
        optional_fields = []
    
    errors = []
    validated_data = {}
    
    # Check for required fields
    for field in required_fields:
        if field not in request_data or request_data[field] is None:
            errors.append(f"Missing required field: {field}")
        else:
            validated_data[field] = request_data[field]
    
    # Include optional fields if present
    for field in optional_fields:
        if field in request_data and request_data[field] is not None:
            validated_data[field] = request_data[field]
    
    # Check for unexpected fields
    allowed_fields = set(required_fields + optional_fields)
    for field in request_data:
        if field not in allowed_fields:
            logger.warning(f"Unexpected field in request: {field}")
    
    is_valid = len(errors) == 0
    
    return is_valid, errors, validated_data