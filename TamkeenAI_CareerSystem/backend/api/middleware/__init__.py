"""
Middleware modules for the API.
"""

# This file makes the middleware directory a Python package 

"""
Authentication middleware module.
Provides JWT-based authentication and role-based access control.
"""

from .auth import (
    generate_token,
    decode_token,
    refresh_access_token,
    jwt_required,
    role_required
)

__all__ = [
    'generate_token',
    'decode_token',
    'refresh_access_token',
    'jwt_required',
    'role_required'
] 