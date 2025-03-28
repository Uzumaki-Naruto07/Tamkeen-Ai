"""
Middleware package for TamkeenAI API.
"""

# Import middleware for easier access
try:
    from api.middleware.auth_middleware import token_required, admin_required
except ImportError:
    pass 