"""
API Utility Module

This module provides utilities for API request handling, validation, and response formatting.
"""

import json
import logging
import re
from typing import Dict, List, Any, Optional, Tuple, Union
from flask import jsonify, request

# Setup logger
logger = logging.getLogger(__name__)


def api_response(data: Any, message: str = "Success", status_code: int = 200, 
                meta: Optional[Dict[str, Any]] = None) -> Tuple[Any, int]:
    """
    Format a standardized API response
    
    Args:
        data: Response data
        message: Response message
        status_code: HTTP status code
        meta: Additional metadata
        
    Returns:
        tuple: Response object and status code
    """
    response = {
        "status": "success",
        "message": message,
        "data": data
    }
    
    if meta:
        response["meta"] = meta
    
    return jsonify(response), status_code


def error_response(message: str, status_code: int = 400, 
                  errors: Optional[Dict[str, Any]] = None) -> Tuple[Any, int]:
    """
    Format a standardized error response
    
    Args:
        message: Error message
        status_code: HTTP status code
        errors: Detailed error information
        
    Returns:
        tuple: Response object and status code
    """
    response = {
        "status": "error",
        "message": message
    }
    
    if errors:
        response["errors"] = errors
    
    return jsonify(response), status_code


def parse_query_params(request) -> Dict[str, Any]:
    """
    Parse and normalize query parameters
    
    Args:
        request: Flask request object
        
    Returns:
        dict: Parsed parameters
    """
    params = {}
    
    # Get all arguments
    for key, value in request.args.items():
        # Convert types
        if value.isdigit():
            params[key] = int(value)
        elif value.lower() in ['true', 'false']:
            params[key] = value.lower() == 'true'
        else:
            params[key] = value
    
    return params


def validate_request(data: Dict[str, Any], rules: Dict[str, Dict[str, Any]]) -> Tuple[bool, Optional[Dict[str, Any]]]:
    """
    Validate request data against rules
    
    Args:
        data: Request data
        rules: Validation rules
        
    Returns:
        tuple: (is_valid, errors)
    """
    errors = {}
    
    # Check required fields
    for field, field_rules in rules.items():
        # Check if field is required and missing
        if field_rules.get('required', False) and (field not in data or data[field] is None):
            errors[field] = "This field is required"
            continue
        
        # Skip validation if field is not in data
        if field not in data or data[field] is None:
            continue
        
        value = data[field]
        
        # Type validation
        if 'type' in field_rules:
            expected_type = field_rules['type']
            
            if expected_type == 'string' and not isinstance(value, str):
                errors[field] = "Must be a string"
            elif expected_type == 'integer' and not isinstance(value, int):
                errors[field] = "Must be an integer"
            elif expected_type == 'number' and not isinstance(value, (int, float)):
                errors[field] = "Must be a number"
            elif expected_type == 'boolean' and not isinstance(value, bool):
                errors[field] = "Must be a boolean"
            elif expected_type == 'array' and not isinstance(value, list):
                errors[field] = "Must be an array"
            elif expected_type == 'object' and not isinstance(value, dict):
                errors[field] = "Must be an object"
        
        # String validations
        if isinstance(value, str):
            # Min length
            if 'min_length' in field_rules and len(value) < field_rules['min_length']:
                errors[field] = f"Must be at least {field_rules['min_length']} characters"
            
            # Max length
            if 'max_length' in field_rules and len(value) > field_rules['max_length']:
                errors[field] = f"Must be at most {field_rules['max_length']} characters"
            
            # Pattern
            if 'pattern' in field_rules and not re.match(field_rules['pattern'], value):
                errors[field] = "Invalid format"
        
        # Number validations
        if isinstance(value, (int, float)):
            # Minimum
            if 'minimum' in field_rules and value < field_rules['minimum']:
                errors[field] = f"Must be at least {field_rules['minimum']}"
            
            # Maximum
            if 'maximum' in field_rules and value > field_rules['maximum']:
                errors[field] = f"Must be at most {field_rules['maximum']}"
        
        # Array validations
        if isinstance(value, list):
            # Min items
            if 'min_items' in field_rules and len(value) < field_rules['min_items']:
                errors[field] = f"Must have at least {field_rules['min_items']} items"
            
            # Max items
            if 'max_items' in field_rules and len(value) > field_rules['max_items']:
                errors[field] = f"Must have at most {field_rules['max_items']} items"
            
            # Item type
            if 'items_type' in field_rules:
                expected_item_type = field_rules['items_type']
                
                for i, item in enumerate(value):
                    if expected_item_type == 'string' and not isinstance(item, str):
                        errors[f"{field}.{i}"] = "Must be a string"
                    elif expected_item_type == 'integer' and not isinstance(item, int):
                        errors[f"{field}.{i}"] = "Must be an integer"
                    elif expected_item_type == 'number' and not isinstance(item, (int, float)):
                        errors[f"{field}.{i}"] = "Must be a number"
                    elif expected_item_type == 'boolean' and not isinstance(item, bool):
                        errors[f"{field}.{i}"] = "Must be a boolean"
                    elif expected_item_type == 'object' and not isinstance(item, dict):
                        errors[f"{field}.{i}"] = "Must be an object"
    
    return len(errors) == 0, errors or None


def paginate_results(items: List[Any], page: int = 1, per_page: int = 20) -> Dict[str, Any]:
    """
    Paginate a list of items
    
    Args:
        items: List of items
        page: Page number
        per_page: Items per page
        
    Returns:
        dict: Pagination result
    """
    # Calculate pagination
    total = len(items)
    total_pages = (total + per_page - 1) // per_page
    
    # Validate page number
    page = max(1, min(page, total_pages)) if total_pages > 0 else 1
    
    # Get page items
    start = (page - 1) * per_page
    end = start + per_page
    page_items = items[start:end]
    
    # Create pagination info
    pagination = {
        "total": total,
        "total_pages": total_pages,
        "current_page": page,
        "per_page": per_page,
        "has_prev": page > 1,
        "has_next": page < total_pages
    }
    
    return {
        "items": page_items,
        "pagination": pagination
    } 