"""
Validation Utility Module

This module provides utilities for validating user input, form data, and other data structures.
"""

import re
import json
from typing import Dict, Any, Optional, Tuple, List, Union, Callable
from datetime import datetime


def validate_required_fields(data: Dict[str, Any], required_fields: List[str]) -> Tuple[bool, Optional[List[str]]]:
    """
    Validate that required fields are present in the data
    
    Args:
        data: Data dictionary
        required_fields: List of required field names
        
    Returns:
        tuple: (is_valid, missing_fields)
    """
    missing = [field for field in required_fields if field not in data or data[field] is None]
    
    if missing:
        return False, missing
    
    return True, None


def validate_string_length(value: str, min_length: int = 0, max_length: Optional[int] = None) -> Tuple[bool, Optional[str]]:
    """
    Validate string length
    
    Args:
        value: String to validate
        min_length: Minimum allowed length
        max_length: Maximum allowed length
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if not isinstance(value, str):
        return False, "Value must be a string"
    
    if len(value) < min_length:
        return False, f"Value must be at least {min_length} characters"
    
    if max_length is not None and len(value) > max_length:
        return False, f"Value must be at most {max_length} characters"
    
    return True, None


def validate_number_range(value: Union[int, float], min_value: Optional[Union[int, float]] = None, 
                         max_value: Optional[Union[int, float]] = None) -> Tuple[bool, Optional[str]]:
    """
    Validate number range
    
    Args:
        value: Number to validate
        min_value: Minimum allowed value
        max_value: Maximum allowed value
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if not isinstance(value, (int, float)):
        return False, "Value must be a number"
    
    if min_value is not None and value < min_value:
        return False, f"Value must be at least {min_value}"
    
    if max_value is not None and value > max_value:
        return False, f"Value must be at most {max_value}"
    
    return True, None


def validate_email(email: str) -> Tuple[bool, Optional[str]]:
    """
    Validate email format
    
    Args:
        email: Email to validate
        
    Returns:
        tuple: (is_valid, error_message)
    """
    # Basic email regex pattern
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not isinstance(email, str):
        return False, "Email must be a string"
    
    if not re.match(pattern, email):
        return False, "Invalid email format"
    
    return True, None


def validate_url(url: str) -> Tuple[bool, Optional[str]]:
    """
    Validate URL format
    
    Args:
        url: URL to validate
        
    Returns:
        tuple: (is_valid, error_message)
    """
    # URL regex pattern
    pattern = r'^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$'
    
    if not isinstance(url, str):
        return False, "URL must be a string"
    
    if not re.match(pattern, url):
        return False, "Invalid URL format"
    
    return True, None


def validate_date(date_str: str, format_str: str = "%Y-%m-%d") -> Tuple[bool, Optional[str]]:
    """
    Validate date format
    
    Args:
        date_str: Date string to validate
        format_str: Expected date format
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if not isinstance(date_str, str):
        return False, "Date must be a string"
    
    try:
        datetime.strptime(date_str, format_str)
        return True, None
    except ValueError:
        return False, f"Invalid date format. Expected format: {format_str}"


def validate_phone_number(phone: str) -> Tuple[bool, Optional[str]]:
    """
    Validate phone number format
    
    Args:
        phone: Phone number to validate
        
    Returns:
        tuple: (is_valid, error_message)
    """
    # Phone number regex pattern (simplified international format)
    pattern = r'^\+?[0-9]{10,15}$'
    
    if not isinstance(phone, str):
        return False, "Phone number must be a string"
    
    # Remove common separators and whitespace
    clean_phone = re.sub(r'[\s\-\(\)\.]+', '', phone)
    
    if not re.match(pattern, clean_phone):
        return False, "Invalid phone number format"
    
    return True, None


def validate_password_strength(password: str) -> Tuple[bool, Optional[str]]:
    """
    Validate password strength
    
    Args:
        password: Password to validate
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if not isinstance(password, str):
        return False, "Password must be a string"
    
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    # Check for uppercase letter
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    # Check for lowercase letter
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    # Check for digit
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one number"
    
    # Check for special character
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character"
    
    return True, None


def validate_username(username: str) -> Tuple[bool, Optional[str]]:
    """
    Validate username format
    
    Args:
        username: Username to validate
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if not isinstance(username, str):
        return False, "Username must be a string"
    
    if len(username) < 3:
        return False, "Username must be at least 3 characters long"
    
    if len(username) > 30:
        return False, "Username must be at most 30 characters long"
    
    # Check for valid characters (letters, numbers, underscore, hyphen)
    if not re.match(r'^[a-zA-Z0-9_\-]+$', username):
        return False, "Username can only contain letters, numbers, underscores, and hyphens"
    
    # Username should start with a letter
    if not username[0].isalpha():
        return False, "Username must start with a letter"
    
    return True, None


def validate_list_length(value_list: List[Any], min_length: int = 0, 
                        max_length: Optional[int] = None) -> Tuple[bool, Optional[str]]:
    """
    Validate list length
    
    Args:
        value_list: List to validate
        min_length: Minimum allowed length
        max_length: Maximum allowed length
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if not isinstance(value_list, list):
        return False, "Value must be a list"
    
    if len(value_list) < min_length:
        return False, f"List must contain at least {min_length} items"
    
    if max_length is not None and len(value_list) > max_length:
        return False, f"List must contain at most {max_length} items"
    
    return True, None


def validate_dict_keys(data: Dict[str, Any], required_keys: List[str]) -> Tuple[bool, Optional[List[str]]]:
    """
    Validate that required keys are present in the dictionary
    
    Args:
        data: Dictionary to validate
        required_keys: List of required keys
        
    Returns:
        tuple: (is_valid, missing_keys)
    """
    if not isinstance(data, dict):
        return False, ["Data must be a dictionary"]
    
    missing = [key for key in required_keys if key not in data]
    
    if missing:
        return False, missing
    
    return True, None


def validate_with_function(value: Any, validation_func: Callable[[Any], bool], 
                         error_message: str) -> Tuple[bool, Optional[str]]:
    """
    Validate value using a custom validation function
    
    Args:
        value: Value to validate
        validation_func: Function that returns True if value is valid
        error_message: Error message to return if validation fails
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if validation_func(value):
        return True, None
    
    return False, error_message


def validate_form_data(data: Dict[str, Any], validation_rules: Dict[str, Dict[str, Any]]) -> Dict[str, List[str]]:
    """
    Validate form data against a set of validation rules
    
    Args:
        data: Form data dictionary
        validation_rules: Dictionary of field names and their validation rules
        
    Returns:
        dict: Dictionary of field names and validation errors
    """
    errors = {}
    
    for field, rules in validation_rules.items():
        field_errors = []
        
        # Skip validation if field is not required and not present
        if not rules.get('required', True) and (field not in data or data[field] is None):
            continue
        
        # Check if required field is missing
        if rules.get('required', True) and (field not in data or data[field] is None):
            field_errors.append("This field is required")
            errors[field] = field_errors
            continue
        
        # Get field value
        value = data.get(field)
        
        # Type validation
        if 'type' in rules:
            if rules['type'] == 'string' and not isinstance(value, str):
                field_errors.append("Must be a string")
            elif rules['type'] == 'number' and not isinstance(value, (int, float)):
                field_errors.append("Must be a number")
            elif rules['type'] == 'integer' and not isinstance(value, int):
                field_errors.append("Must be an integer")
            elif rules['type'] == 'boolean' and not isinstance(value, bool):
                field_errors.append("Must be a boolean")
            elif rules['type'] == 'array' and not isinstance(value, list):
                field_errors.append("Must be an array")
            elif rules['type'] == 'object' and not isinstance(value, dict):
                field_errors.append("Must be an object")
        
        # Skip further validation if type check failed
        if field_errors:
            errors[field] = field_errors
            continue
        
        # String validation
        if isinstance(value, str):
            # Min length
            if 'min_length' in rules and len(value) < rules['min_length']:
                field_errors.append(f"Must be at least {rules['min_length']} characters")
            
            # Max length
            if 'max_length' in rules and len(value) > rules['max_length']:
                field_errors.append(f"Must be at most {rules['max_length']} characters")
            
            # Pattern matching
            if 'pattern' in rules and not re.match(rules['pattern'], value):
                field_errors.append(rules.get('pattern_message', "Value does not match required pattern"))
            
            # Email validation
            if rules.get('email', False):
                is_valid, error = validate_email(value)
                if not is_valid:
                    field_errors.append(error)
            
            # URL validation
            if rules.get('url', False):
                is_valid, error = validate_url(value)
                if not is_valid:
                    field_errors.append(error)
            
            # Date validation
            if rules.get('date', False):
                format_str = rules.get('date_format', "%Y-%m-%d")
                is_valid, error = validate_date(value, format_str)
                if not is_valid:
                    field_errors.append(error)
        
        # Numeric validation
        if isinstance(value, (int, float)):
            # Min value
            if 'min_value' in rules and value < rules['min_value']:
                field_errors.append(f"Must be at least {rules['min_value']}")
            
            # Max value
            if 'max_value' in rules and value > rules['max_value']:
                field_errors.append(f"Must be at most {rules['max_value']}")
        
        # List validation
        if isinstance(value, list):
            # Min length
            if 'min_items' in rules and len(value) < rules['min_items']:
                field_errors.append(f"Must have at least {rules['min_items']} items")
            
            # Max length
            if 'max_items' in rules and len(value) > rules['max_items']:
                field_errors.append(f"Must have at most {rules['max_items']} items")
            
            # Item validation
            if 'items' in rules and value:
                for i, item in enumerate(value):
                    if 'type' in rules['items']:
                        if rules['items']['type'] == 'string' and not isinstance(item, str):
                            field_errors.append(f"Item {i+1} must be a string")
                        elif rules['items']['type'] == 'number' and not isinstance(item, (int, float)):
                            field_errors.append(f"Item {i+1} must be a number")
                        elif rules['items']['type'] == 'integer' and not isinstance(item, int):
                            field_errors.append(f"Item {i+1} must be an integer")
                        elif rules['items']['type'] == 'boolean' and not isinstance(item, bool):
                            field_errors.append(f"Item {i+1} must be a boolean")
                        elif rules['items']['type'] == 'object' and not isinstance(item, dict):
                            field_errors.append(f"Item {i+1} must be an object")
        
        # Custom validation function
        if 'custom_validator' in rules and callable(rules['custom_validator']):
            is_valid, error = validate_with_function(
                value, 
                rules['custom_validator'], 
                rules.get('custom_error', "Invalid value")
            )
            if not is_valid:
                field_errors.append(error)
        
        if field_errors:
            errors[field] = field_errors
    
    return errors 