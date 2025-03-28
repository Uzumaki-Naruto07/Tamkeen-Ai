"""
Database package for the TamkeenAI API.
"""

# Import database models for easier access
try:
    from api.database.models import User, Resume, Job
except ImportError:
    pass 