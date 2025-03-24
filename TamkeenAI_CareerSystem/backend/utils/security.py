"""
Security Utility Module

This module provides utilities for security, input validation, and protection
against common attacks.
"""

import re
import json
import html
from typing import Dict, Any, Optional, Tuple, List, Union
from flask import request, current_app


def sanitize_html(text: str) -> str:
    """
    Sanitize HTML by escaping special characters
    
    Args:
        text: Input text
        
    Returns:
        str: Sanitized text
    """
    if not text:
        return ""
    
    return html.escape(text)


def sanitize_input(data: Any) -> Any:
    """
    Recursively sanitize user input
    
    Args:
        data: Input data (string, dict, list, etc.)
        
    Returns:
        Any: Sanitized data
    """
    if isinstance(data, str):
        return sanitize_html(data)
    
    elif isinstance(data, dict):
        return {k: sanitize_input(v) for k, v in data.items()}
    
    elif isinstance(data, list):
        return [sanitize_input(item) for item in data]
    
    return data


def validate_json_request() -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
    """
    Validate and parse JSON from request
    
    Returns:
        tuple: (is_valid, data, error_message)
    """
    if not request.is_json:
        return False, None, "Request must be JSON"
    
    try:
        data = request.get_json()
        
        if data is None:
            return False, None, "Invalid JSON data"
        
        return True, data, None
    
    except Exception as e:
        current_app.logger.error(f"Error parsing JSON: {str(e)}")
        return False, None, f"Error parsing JSON: {str(e)}"


def validate_request_args(required_args: List[str]) -> Tuple[bool, Optional[str]]:
    """
    Validate required query parameters
    
    Args:
        required_args: List of required parameter names
        
    Returns:
        tuple: (is_valid, error_message)
    """
    for arg in required_args:
        if arg not in request.args:
            return False, f"Missing required parameter: {arg}"
    
    return True, None


def validate_request_form(required_fields: List[str]) -> Tuple[bool, Optional[str]]:
    """
    Validate required form fields
    
    Args:
        required_fields: List of required field names
        
    Returns:
        tuple: (is_valid, error_message)
    """
    for field in required_fields:
        if field not in request.form:
            return False, f"Missing required field: {field}"
    
    return True, None


def validate_request_files(required_files: List[str]) -> Tuple[bool, Optional[str]]:
    """
    Validate required files in request
    
    Args:
        required_files: List of required file field names
        
    Returns:
        tuple: (is_valid, error_message)
    """
    for file_field in required_files:
        if file_field not in request.files:
            return False, f"Missing required file: {file_field}"
        
        # Check if file is empty
        if request.files[file_field].filename == '':
            return False, f"Empty file: {file_field}"
    
    return True, None


def get_client_ip() -> str:
    """
    Get client IP address
    
    Returns:
        str: Client IP address
    """
    # Check for X-Forwarded-For header
    if request.headers.getlist("X-Forwarded-For"):
        return request.headers.getlist("X-Forwarded-For")[0].split(',')[0].strip()
    
    # Check for X-Real-IP header
    if request.headers.get("X-Real-IP"):
        return request.headers.get("X-Real-IP")
    
    # Fall back to remote_addr
    return request.remote_addr or "unknown"


def validate_file_size(file, max_size_mb: float = 10.0) -> Tuple[bool, Optional[str]]:
    """
    Validate file size
    
    Args:
        file: File object
        max_size_mb: Maximum size in MB
        
    Returns:
        tuple: (is_valid, error_message)
    """
    # Get file size in bytes
    file.seek(0, 2)  # Seek to end of file
    size = file.tell()  # Get current position (size)
    file.seek(0)  # Reset position to beginning
    
    max_size_bytes = max_size_mb * 1024 * 1024
    
    if size > max_size_bytes:
        return False, f"File size exceeds maximum allowed size of {max_size_mb}MB"
    
    return True, None


def validate_json_schema(data: Dict[str, Any], schema: Dict[str, Any]) -> Tuple[bool, Optional[List[str]]]:
    """
    Validate JSON data against a schema
    
    Args:
        data: JSON data
        schema: JSON schema
        
    Returns:
        tuple: (is_valid, errors)
    """
    try:
        import jsonschema
        validator = jsonschema.Draft7Validator(schema)
        errors = list(validator.iter_errors(data))
        
        if errors:
            error_messages = [error.message for error in errors]
            return False, error_messages
        
        return True, None
    
    except ImportError:
        current_app.logger.warning("jsonschema not installed. Install with: pip install jsonschema")
        
        # Perform basic validation if jsonschema is not available
        errors = []
        
        for field, field_schema in schema.get('properties', {}).items():
            # Check required fields
            if field_schema.get('required', False) and field not in data:
                errors.append(f"Missing required field: {field}")
            
            # Check field types
            if field in data and 'type' in field_schema:
                field_type = field_schema['type']
                
                if field_type == 'string' and not isinstance(data[field], str):
                    errors.append(f"Field {field} must be a string")
                
                elif field_type == 'number' and not isinstance(data[field], (int, float)):
                    errors.append(f"Field {field} must be a number")
                
                elif field_type == 'integer' and not isinstance(data[field], int):
                    errors.append(f"Field {field} must be an integer")
                
                elif field_type == 'boolean' and not isinstance(data[field], bool):
                    errors.append(f"Field {field} must be a boolean")
                
                elif field_type == 'array' and not isinstance(data[field], list):
                    errors.append(f"Field {field} must be an array")
                
                elif field_type == 'object' and not isinstance(data[field], dict):
                    errors.append(f"Field {field} must be an object")
        
        if errors:
            return False, errors
        
        return True, None 