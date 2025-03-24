"""
Response Utility Module

This module provides utility functions for formatting API responses.
"""

from typing import Dict, Any, Optional, Union, List
from flask import jsonify


def api_response(data: Union[Dict[str, Any], List[Any]], status_code: int = 200):
    """
    Format API success response
    
    Args:
        data: Response data
        status_code: HTTP status code
        
    Returns:
        Flask response object
    """
    response = jsonify(data)
    response.status_code = status_code
    return response


def error_response(message: str, status_code: int = 400, errors: Optional[List[str]] = None):
    """
    Format API error response
    
    Args:
        message: Error message
        status_code: HTTP status code
        errors: Optional list of detailed errors
        
    Returns:
        Flask response object
    """
    response_data = {
        "error": True,
        "message": message
    }
    
    if errors:
        response_data["errors"] = errors
    
    response = jsonify(response_data)
    response.status_code = status_code
    return response


def paginated_response(items: List[Any], 
                      page: int, 
                      per_page: int, 
                      total: int, 
                      resource_name: str = "items"):
    """
    Format paginated API response
    
    Args:
        items: List of items
        page: Current page number
        per_page: Items per page
        total: Total number of items
        resource_name: Name of the resource
        
    Returns:
        Flask response object
    """
    # Calculate pagination information
    total_pages = (total + per_page - 1) // per_page  # Ceiling division
    has_next = page < total_pages
    has_prev = page > 1
    
    # Create response
    response_data = {
        resource_name: items,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total_items": total,
            "total_pages": total_pages,
            "has_next": has_next,
            "has_prev": has_prev
        }
    }
    
    return api_response(response_data)


def success_response(message: str, data: Optional[Dict[str, Any]] = None):
    """
    Format success message response
    
    Args:
        message: Success message
        data: Optional additional data
        
    Returns:
        Flask response object
    """
    response_data = {
        "success": True,
        "message": message
    }
    
    if data:
        response_data.update(data)
    
    return api_response(response_data)


def validation_error_response(errors: Dict[str, List[str]]):
    """
    Format validation error response
    
    Args:
        errors: Dictionary of field errors
        
    Returns:
        Flask response object
    """
    response_data = {
        "error": True,
        "message": "Validation error",
        "validation_errors": errors
    }
    
    response = jsonify(response_data)
    response.status_code = 422  # Unprocessable Entity
    return response


def not_found_response(resource_type: str, resource_id: str):
    """
    Format not found error response
    
    Args:
        resource_type: Type of resource
        resource_id: ID of resource
        
    Returns:
        Flask response object
    """
    message = f"{resource_type} with ID {resource_id} not found"
    
    response_data = {
        "error": True,
        "message": message,
        "resource_type": resource_type,
        "resource_id": resource_id
    }
    
    response = jsonify(response_data)
    response.status_code = 404
    return response


def unauthorized_response(message: str = "Unauthorized access"):
    """
    Format unauthorized error response
    
    Args:
        message: Error message
        
    Returns:
        Flask response object
    """
    response_data = {
        "error": True,
        "message": message
    }
    
    response = jsonify(response_data)
    response.status_code = 401
    return response


def forbidden_response(message: str = "Access forbidden"):
    """
    Format forbidden error response
    
    Args:
        message: Error message
        
    Returns:
        Flask response object
    """
    response_data = {
        "error": True,
        "message": message
    }
    
    response = jsonify(response_data)
    response.status_code = 403
    return response


def server_error_response(message: str = "Internal server error"):
    """
    Format server error response
    
    Args:
        message: Error message
        
    Returns:
        Flask response object
    """
    response_data = {
        "error": True,
        "message": message
    }
    
    response = jsonify(response_data)
    response.status_code = 500
    return response 